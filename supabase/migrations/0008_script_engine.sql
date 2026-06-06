-- 0008 Script Node Engine — operational tables.
-- The template library (hooks/nodes/recipes/compat/slot registry) lives in-repo
-- (lib/script-engine/data). These tables hold per-agent runtime state only.

-- ── agent slots + tone profile (extend agent_branding) ─────────────────────
alter table agent_branding add column if not exists so_nam_kn int;
alter table agent_branding add column if not exists so_giao_dich int;
alter table agent_branding add column if not exists khu_vuc_chuyen text;
alter table agent_branding add column if not exists kenh_dat text;
alter table agent_branding add column if not exists tone_profile text[] not null default '{chuyen_gia,than_thien}';

-- ── per-agent slot overrides for a project (fills MISSING_SLOTS) ───────────
create table if not exists project_script_facts (
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  key text not null,
  value jsonb not null,
  source text,
  valid_until date,
  updated_at timestamptz default now(),
  primary key (user_id, project_id, key)
);

-- ── per-agent market data cache by region (requires source — R5) ───────────
create table if not exists market_facts (
  user_id uuid not null references profiles(id) on delete cascade,
  khu_vuc text not null default '',
  key text not null,
  value jsonb not null,
  source text not null,
  valid_until date,
  updated_at timestamptz default now(),
  primary key (user_id, khu_vuc, key)
);

-- ── output log (reproducible from seed + slot_snapshot — P4) ───────────────
create table if not exists generated_scripts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  recipe_id text not null,
  hook_id text not null,
  node_ids text[] not null,
  seed text not null,
  slot_snapshot jsonb not null,
  output jsonb not null,
  lint_warnings jsonb,
  platform text,
  duration_s int,
  created_at timestamptz default now()
);
create index if not exists idx_scripts_user on generated_scripts(user_id, created_at desc);

-- ── anti-repetition state (R4) ─────────────────────────────────────────────
create table if not exists rotation_state (
  user_id uuid not null references profiles(id) on delete cascade,
  template_id text not null,
  last_used_at timestamptz not null default now(),
  use_count int not null default 1,
  primary key (user_id, template_id)
);
create index if not exists idx_rotation_user on rotation_state(user_id, last_used_at);

-- ── performance ingest (P5) ────────────────────────────────────────────────
create table if not exists script_performance (
  id uuid primary key default gen_random_uuid(),
  script_id uuid not null references generated_scripts(id) on delete cascade,
  platform text,
  views int, retention_3s numeric, retention_50 numeric, completion numeric,
  likes int, comments int, saves int, leads int,
  recorded_at timestamptz default now()
);
create index if not exists idx_perf_script on script_performance(script_id, recorded_at desc);

-- ── RLS: every table is owned by the agent (user_id = auth.uid()) ──────────
alter table project_script_facts enable row level security;
alter table market_facts         enable row level security;
alter table generated_scripts    enable row level security;
alter table rotation_state       enable row level security;
alter table script_performance   enable row level security;

drop policy if exists psf_rw on project_script_facts;
create policy psf_rw on project_script_facts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists mf_rw on market_facts;
create policy mf_rw on market_facts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists scripts_rw on generated_scripts;
create policy scripts_rw on generated_scripts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists rotation_rw on rotation_state;
create policy rotation_rw on rotation_state for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists perf_rw on script_performance;
create policy perf_rw on script_performance for all
  using (exists (select 1 from generated_scripts s where s.id = script_id and s.user_id = auth.uid()))
  with check (exists (select 1 from generated_scripts s where s.id = script_id and s.user_id = auth.uid()));
