-- 0004_rearchitecture.sql — Phase-1 re-architecture (Hybrid).
-- Source of truth: docs/ARCHITECTURE.md (architecture guide v2).
--
-- ⚠️ DESTRUCTIVE — REVIEW BEFORE APPLYING. Not auto-applied by the assistant.
-- Drops org multi-tenancy + the ingestion pipeline + the old map tables, then
-- adopts the content-engine schema. Map data is reproduced from
-- docs/knowledge/*.html via scripts/gen_project_map.mjs (see seed_knowledge_*.sql).
--
-- Decisions folded in (vs the guide):
--   * price_confidence uses its own enum price_confidence_t (guide bug: the
--     default 'broker_estimate' is not a value of confidence_t).
--   * node_content_blocks.fact_keys[] lets compliance gate the exact facts a
--     block cites (guide left block→fact linkage undefined).
--   * subscriptions.seats is stored but multi-seat enforcement is deferred (P2).
--   * generated_post_nodes join table backs the "nodes user chưa dùng" query
--     (an uuid[] column can't be FK-checked).

begin;

-- ============================================================
-- 1) DROP obsolete: ingestion + org tenancy + old map
-- ============================================================
drop table if exists content_suggestions cascade;
drop table if exists extractions cascade;
drop table if exists documents cascade;
drop table if exists map_edges cascade;
drop table if exists map_nodes cascade;

-- profiles + projects carry org_id; recreate them clean below.
drop table if exists projects cascade;
drop table if exists profiles cascade;
drop table if exists orgs cascade;

drop function if exists auth_org_id() cascade;
drop function if exists auth_is_admin() cascade;

-- `leads` (contact form) has no org dependency — keep as-is.

-- ============================================================
-- 2) ENUMS
-- ============================================================
do $$ begin create type confidence_t       as enum ('verified','sales_claim','unverified'); exception when duplicate_object then null; end $$;
do $$ begin create type price_confidence_t as enum ('verified','broker_estimate','developer_quote'); exception when duplicate_object then null; end $$;
do $$ begin create type infra_status_t     as enum ('done','under_construction','soon','planned'); exception when duplicate_object then null; end $$;
do $$ begin create type block_role_t       as enum ('hook','body','proof','cta'); exception when duplicate_object then null; end $$;
do $$ begin create type block_tone_t       as enum ('neutral','fomo','story'); exception when duplicate_object then null; end $$;
do $$ begin create type tier_t             as enum ('free','pro','team'); exception when duplicate_object then null; end $$;
do $$ begin create type sub_status_t       as enum ('active','past_due','canceled'); exception when duplicate_object then null; end $$;
do $$ begin create type asset_type_t       as enum ('image','video_clip'); exception when duplicate_object then null; end $$;
do $$ begin create type user_role_t        as enum ('agent','admin'); exception when duplicate_object then null; end $$;
do $$ begin create type trigger_type_t     as enum ('deadline','milestone','event'); exception when duplicate_object then null; end $$;

-- ============================================================
-- 3) CORE: developers, projects, profiles
-- ============================================================
create table developers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  charter_capital bigint,
  parent_company text,
  credibility int check (credibility between 1 and 10),
  logo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  developer_id uuid references developers(id) on delete set null,
  name text not null,
  slug text unique not null,
  phase text,
  location_text text,
  lat numeric, lng numeric,
  status text default 'open',
  handover_est date,
  price_min bigint, price_max bigint,
  price_confidence price_confidence_t default 'broker_estimate',
  view360_url text,
  thumbnail_url text,
  is_demo boolean default false,        -- free tier accessible
  is_published boolean default false,   -- admin flips when blocks are ready
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- profiles extend auth.users (no org; role = agent|admin)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role user_role_t default 'agent',
  agency_name text,
  created_at timestamptz default now()
);

-- auto-create a profile row on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function handle_new_user();
-- trigger-only: not meant to be callable via PostgREST RPC
revoke execute on function handle_new_user() from anon, authenticated;

-- caller's admin status (used in RLS)
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from profiles where id = auth.uid()), false)
$$;

-- ============================================================
-- 4) KNOWLEDGE MAP (first-class)
-- ============================================================
create table knowledge_nodes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  node_key text not null,               -- stable key e.g. 'lien-phuong'
  label text not null,
  category text not null,               -- project|group|brand|partner|masterplan|
                                        -- cluster|event|infra|finance|developer|cert|
                                        -- metro|road|amenity|location|comparable|policy
  sub_label text,
  facts jsonb not null default '[]',    -- [{key,value,confidence,source}]
  talkpoint text,
  description text,
  sort_order int default 0,
  is_enabled boolean default true,
  unique (project_id, node_key)
);
create index idx_nodes_project on knowledge_nodes(project_id, category);

create table knowledge_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  source_node uuid not null references knowledge_nodes(id) on delete cascade,
  target_node uuid not null references knowledge_nodes(id) on delete cascade,
  label text
);
create index idx_links_project on knowledge_links(project_id);

-- ============================================================
-- 5) CONTENT ENGINE
-- ============================================================
create table node_content_blocks (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references knowledge_nodes(id) on delete cascade,
  role block_role_t not null,
  variant_no int not null default 1,
  text text not null,                   -- holds [TEN_SALE] [SDT] [LINK_360]
  tone block_tone_t default 'neutral',
  min_confidence confidence_t default 'verified',
  fact_keys text[] not null default '{}', -- which node facts this block cites
  is_enabled boolean default true,
  unique (node_id, role, variant_no)
);
create index idx_blocks_node on node_content_blocks(node_id, role);

create table assembly_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  angle_match text[] not null,          -- categories that activate it
  structure jsonb not null,             -- ordered slots ["hook","body","proof","cta"]
  weight int default 1,
  is_enabled boolean default true
);

create table node_assets (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references knowledge_nodes(id) on delete cascade,
  type asset_type_t not null default 'image',
  storage_path text not null,
  width int, height int,
  safe_zone text default 'bottom_right',
  sort_order int default 0,
  is_enabled boolean default true
);
create index idx_assets_node on node_assets(node_id);

-- ============================================================
-- 6) USERS & BRANDING
-- ============================================================
create table agent_branding (
  user_id uuid primary key references profiles(id) on delete cascade,
  display_name text not null,
  phone text not null,
  zalo text,
  logo_path text,
  position text default 'bottom_right',
  updated_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  tier tier_t not null default 'free',
  status sub_status_t not null default 'active',
  seats int default 1,                  -- stored; multi-seat enforcement = Phase 2
  current_period_end timestamptz,
  payos_order_code text unique,         -- unique → webhook idempotency
  created_at timestamptz default now()
);
create index idx_subs_user on subscriptions(user_id, status);

-- ============================================================
-- 7) OUTPUT LOG
-- ============================================================
create table generated_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  node_ids uuid[] not null,
  template_id uuid references assembly_templates(id) on delete set null,
  variant_seed text not null,
  caption text not null,
  image_paths text[],
  prompt_version text,
  created_at timestamptz default now()
);
create index idx_posts_user on generated_posts(user_id, created_at desc);
create index idx_posts_project on generated_posts(project_id, created_at desc);

-- join table: integrity-checked node usage (uuid[] above can't be FK'd)
create table generated_post_nodes (
  post_id uuid not null references generated_posts(id) on delete cascade,
  node_id uuid not null references knowledge_nodes(id) on delete cascade,
  primary key (post_id, node_id)
);
create index idx_gpn_node on generated_post_nodes(node_id);

-- ============================================================
-- 8) BRANDED CACHE
-- ============================================================
create table branded_assets (
  asset_id uuid not null references node_assets(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  storage_path text not null,
  branding_hash text not null,
  created_at timestamptz default now(),
  primary key (asset_id, user_id)
);

-- ============================================================
-- 9) AUTOPILOT — "Hôm Nay"
-- ============================================================
create table time_triggers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  type trigger_type_t not null,
  trigger_date date not null,
  label text not null,
  suggested_angle text,
  node_ids uuid[] default '{}',
  active_days_before int default 7,
  is_enabled boolean default true
);
create index idx_triggers_date on time_triggers(trigger_date, is_enabled);

create table quick_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  text text not null,
  remind_at date,
  done_at timestamptz,
  created_at timestamptz default now()
);
create index idx_notes_due on quick_notes(user_id, remind_at) where done_at is null;

-- ============================================================
-- 10) RLS
-- ============================================================
alter table developers          enable row level security;
alter table projects            enable row level security;
alter table profiles            enable row level security;
alter table knowledge_nodes     enable row level security;
alter table knowledge_links     enable row level security;
alter table node_content_blocks enable row level security;  -- no policy → service-only
alter table assembly_templates  enable row level security;  -- no policy → service-only
alter table node_assets         enable row level security;
alter table agent_branding      enable row level security;
alter table subscriptions       enable row level security;
alter table generated_posts     enable row level security;
alter table generated_post_nodes enable row level security;
alter table branded_assets      enable row level security;
alter table time_triggers       enable row level security;
alter table quick_notes         enable row level security;

-- helper: a project is visible to the caller (anon→demo+published, authed→published)
-- inlined per table to keep policies index-friendly.

-- developers: world-readable; admin writes
create policy developers_read on developers for select using (true);
create policy developers_admin on developers for all using (is_admin()) with check (is_admin());

-- projects
create policy projects_read on projects for select using (
  is_admin() or (is_published = true and (is_demo = true or auth.uid() is not null))
);
create policy projects_admin on projects for all using (is_admin()) with check (is_admin());

-- knowledge_nodes / links / node_assets / time_triggers: gated by parent project
create policy nodes_read on knowledge_nodes for select using (
  is_admin() or exists (select 1 from projects p where p.id = knowledge_nodes.project_id
    and p.is_published = true and (p.is_demo = true or auth.uid() is not null))
);
create policy nodes_admin on knowledge_nodes for all using (is_admin()) with check (is_admin());

create policy links_read on knowledge_links for select using (
  is_admin() or exists (select 1 from projects p where p.id = knowledge_links.project_id
    and p.is_published = true and (p.is_demo = true or auth.uid() is not null))
);
create policy links_admin on knowledge_links for all using (is_admin()) with check (is_admin());

create policy assets_read on node_assets for select using (
  is_admin() or exists (
    select 1 from knowledge_nodes n join projects p on p.id = n.project_id
    where n.id = node_assets.node_id and p.is_published = true
      and (p.is_demo = true or auth.uid() is not null))
);
create policy assets_admin on node_assets for all using (is_admin()) with check (is_admin());

create policy triggers_read on time_triggers for select using (
  is_admin() or exists (select 1 from projects p where p.id = time_triggers.project_id
    and p.is_published = true and (p.is_demo = true or auth.uid() is not null))
);
create policy triggers_admin on time_triggers for all using (is_admin()) with check (is_admin());

-- profiles: read own/admin; writes server-side (service client) to avoid
-- role self-escalation. No client INSERT/UPDATE policy on purpose.
create policy profiles_read on profiles for select using (id = auth.uid() or is_admin());

-- agent_branding: own row CRUD
create policy branding_rw on agent_branding for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- subscriptions: own read; writes service-only (webhook)
create policy subs_read on subscriptions for select using (user_id = auth.uid() or is_admin());

-- generated_posts: own read/insert; admin read
create policy posts_read on generated_posts for select using (user_id = auth.uid() or is_admin());
create policy posts_insert on generated_posts for insert with check (user_id = auth.uid());

-- generated_post_nodes: visible via owning post
create policy gpn_read on generated_post_nodes for select using (
  exists (select 1 from generated_posts gp where gp.id = post_id
    and (gp.user_id = auth.uid() or is_admin()))
);
create policy gpn_insert on generated_post_nodes for insert with check (
  exists (select 1 from generated_posts gp where gp.id = post_id and gp.user_id = auth.uid())
);

-- branded_assets: own rows
create policy branded_rw on branded_assets for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- quick_notes: own rows full CRUD
create policy notes_rw on quick_notes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
