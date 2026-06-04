-- ============================================================
-- batdongsan — full setup: run once in Supabase SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)
-- ============================================================

-- ===== 0001_init.sql =====
-- M0/M1 — MVP schema (multi-tenant subset of MASTER_ROADMAP §6 / MVP §4)
-- org_id + RLS from day one so B2B expansion needs no refactor.

create extension if not exists "pgcrypto";

-- Organisations (one per brokerage/developer tenant) ------------------------
create table if not exists orgs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Profiles map auth.users -> org + role -------------------------------------
create table if not exists profiles (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  org_id      uuid references orgs (id) on delete set null,
  role        text not null default 'member' check (role in ('admin', 'member')),
  created_at  timestamptz not null default now()
);

-- Projects (structured knowledge) -------------------------------------------
create table if not exists projects (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references orgs (id) on delete cascade,
  slug            text not null,
  name            text not null,
  developer       text,
  district        text,
  city            text,
  segment         text,
  status          text,
  price_per_sqm_m numeric,
  attributes      jsonb not null default '{}'::jsonb,   -- amenities[], highlights[]
  visibility      text not null default 'org' check (visibility in ('org', 'public')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (org_id, slug)
);

-- Uploaded source files ------------------------------------------------------
create table if not exists documents (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references orgs (id) on delete cascade,
  project_id    uuid references projects (id) on delete cascade,
  storage_path  text not null,
  filename      text,
  mime          text,
  content_hash  text,
  status        text not null default 'pending' check (status in ('pending', 'parsed', 'error')),
  created_at    timestamptz not null default now()
);

-- Rule-based extraction results (with provenance) ---------------------------
create table if not exists extractions (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references orgs (id) on delete cascade,
  document_id  uuid not null references documents (id) on delete cascade,
  project_id   uuid references projects (id) on delete cascade,
  field        text not null,
  value        text,
  source_span  text,
  confidence   numeric,
  status       text not null default 'suggested' check (status in ('suggested', 'confirmed', 'rejected')),
  created_at   timestamptz not null default now()
);

-- Generated lead-gen content -------------------------------------------------
create table if not exists content_suggestions (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references orgs (id) on delete cascade,
  project_id     uuid not null references projects (id) on delete cascade,
  format         text not null,                 -- facebook_post | short_caption
  rendered       jsonb not null default '{}'::jsonb,
  used_facts     jsonb not null default '{}'::jsonb,
  missing_slots  text[] not null default '{}',
  status         text not null default 'suggested',
  edited_body    text,
  created_at     timestamptz not null default now()
);

-- Sales leads from the "contact to buy" form (manual billing) ---------------
create table if not exists leads (
  id          uuid primary key default gen_random_uuid(),
  org_name    text,
  contact     text not null,
  message     text,
  seats       int,
  created_at  timestamptz not null default now()
);

create index if not exists idx_projects_org on projects (org_id);
create index if not exists idx_documents_org on documents (org_id);
create index if not exists idx_extractions_doc on extractions (document_id);
create index if not exists idx_content_project on content_suggestions (project_id);

-- ===== 0002_rls.sql =====
-- M1 — Row Level Security: tenant isolation by org_id.
-- A member only sees rows in their own org; public projects are world-readable.

-- Helper: the caller's org id, read from their profile. ----------------------
create or replace function auth_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select org_id from profiles where user_id = auth.uid()
$$;

-- Helper: is the caller an admin of their org? ------------------------------
create or replace function auth_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from profiles where user_id = auth.uid()), false)
$$;

alter table orgs                enable row level security;
alter table profiles            enable row level security;
alter table projects            enable row level security;
alter table documents           enable row level security;
alter table extractions         enable row level security;
alter table content_suggestions enable row level security;
alter table leads               enable row level security;

-- orgs: members read their own org; no client writes (created server-side). --
create policy orgs_read on orgs
  for select using (id = auth_org_id());

-- profiles: a user reads profiles in their org or their own row.
-- Writes are server-side only (onboarding uses the service-role client), so we
-- intentionally grant NO client insert/update policy. This closes a privilege-
-- escalation hole: a self-update policy would let a member set role='admin' on
-- their own row.
create policy profiles_read on profiles
  for select using (org_id = auth_org_id() or user_id = auth.uid());

-- projects: org members read org rows; anyone reads public rows. ------------
create policy projects_read on projects
  for select using (visibility = 'public' or org_id = auth_org_id());
create policy projects_admin_write on projects
  for all using (org_id = auth_org_id() and auth_is_admin())
  with check (org_id = auth_org_id() and auth_is_admin());

-- documents / extractions: admin-only, same org. ---------------------------
create policy documents_admin on documents
  for all using (org_id = auth_org_id() and auth_is_admin())
  with check (org_id = auth_org_id() and auth_is_admin());

create policy extractions_admin on extractions
  for all using (org_id = auth_org_id() and auth_is_admin())
  with check (org_id = auth_org_id() and auth_is_admin());

-- content_suggestions: any org member reads; org members create/edit. -------
create policy content_read on content_suggestions
  for select using (org_id = auth_org_id());
create policy content_write on content_suggestions
  for all using (org_id = auth_org_id())
  with check (org_id = auth_org_id());

-- leads: no client access; inserted via service role (server) only. ---------
-- (RLS enabled + no policy => denied for anon/authenticated; service role bypasses.)

-- ===== 0003_project_maps.sql =====
-- Per-project knowledge graphs: each project has its own Obsidian-style map of
-- concepts (amenities, selling points, location, legal, sub-zones, related
-- projects...). Admin-authored and updatable; scoped by org for tenant
-- isolation. Avoids the cross-project map overflowing at thousands of projects.

create table if not exists map_nodes (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs (id) on delete cascade,
  project_id  uuid not null references projects (id) on delete cascade,
  label       text not null,
  kind        text not null default 'concept',  -- concept|amenity|selling_point|location|legal|zone|related
  note        text,                              -- optional detail shown on focus
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists map_edges (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references orgs (id) on delete cascade,
  project_id  uuid not null references projects (id) on delete cascade,
  source_id   uuid not null references map_nodes (id) on delete cascade,
  target_id   uuid not null references map_nodes (id) on delete cascade,
  kind        text not null default 'relates',  -- relates|part_of|near|supports
  created_at  timestamptz not null default now()
);

create index if not exists idx_map_nodes_project on map_nodes (project_id);
create index if not exists idx_map_edges_project on map_edges (project_id);
create index if not exists idx_map_edges_source on map_edges (source_id);
create index if not exists idx_map_edges_target on map_edges (target_id);

alter table map_nodes enable row level security;
alter table map_edges enable row level security;

-- Read: org members see their org's maps; anyone sees maps of public projects.
create policy map_nodes_read on map_nodes
  for select using (
    org_id = auth_org_id()
    or project_id in (select id from projects where visibility = 'public')
  );
create policy map_edges_read on map_edges
  for select using (
    org_id = auth_org_id()
    or project_id in (select id from projects where visibility = 'public')
  );

-- Write: admins of the owning org only.
create policy map_nodes_admin on map_nodes
  for all using (org_id = auth_org_id() and auth_is_admin())
  with check (org_id = auth_org_id() and auth_is_admin());
create policy map_edges_admin on map_edges
  for all using (org_id = auth_org_id() and auth_is_admin())
  with check (org_id = auth_org_id() and auth_is_admin());

-- ===== seed.sql =====
-- M7 seed — a demo org with public projects + one knowledge map, so the app
-- shows real content on first deploy (and the landing demo works signed-out).
-- Idempotent: fixed UUIDs + ON CONFLICT, safe to re-run.

-- Demo org -------------------------------------------------------------------
insert into orgs (id, name) values
  ('00000000-0000-0000-0000-0000000000d0', 'Demo Sàn BĐS')
on conflict (id) do nothing;

-- Projects — all public so the signed-out landing demo shows real
-- relationships (same developer / same district / same segment edges).
insert into projects (id, org_id, slug, name, developer, district, city, segment, status, price_per_sqm_m, attributes, visibility) values
  ('00000000-0000-0000-0000-00000000a001',
   '00000000-0000-0000-0000-0000000000d0',
   'gladia-by-the-water', 'Gladia by The Water', 'Masterise Homes',
   'TP. Thủ Đức', 'TP.HCM', 'luxury', 'selling', 160,
   '{"amenities":["view sông","hồ bơi","công viên ven sông","an ninh 24/7"],"highlights":["Vị trí ven sông Sài Gòn","Bàn giao cao cấp"]}'::jsonb,
   'public'),
  ('00000000-0000-0000-0000-00000000a002',
   '00000000-0000-0000-0000-0000000000d0',
   'masteri-thao-dien', 'Masteri Thảo Điền', 'Masterise Homes',
   'Quận 2', 'TP.HCM', 'high-end', 'completed', 95,
   '{"amenities":["hồ bơi","gym","trung tâm thương mại"]}'::jsonb, 'public'),
  ('00000000-0000-0000-0000-00000000a003',
   '00000000-0000-0000-0000-0000000000d0',
   'masteri-an-phu', 'Masteri An Phú', 'Masterise Homes',
   'Quận 2', 'TP.HCM', 'high-end', 'handover', 110,
   '{"amenities":["hồ bơi","gym"]}'::jsonb, 'public'),
  ('00000000-0000-0000-0000-00000000a004',
   '00000000-0000-0000-0000-0000000000d0',
   'the-river-thu-thiem', 'The River Thủ Thiêm', 'Refico',
   'TP. Thủ Đức', 'TP.HCM', 'luxury', 'handover', 150,
   '{"amenities":["view sông","hồ bơi"]}'::jsonb, 'public'),
  ('00000000-0000-0000-0000-00000000a005',
   '00000000-0000-0000-0000-0000000000d0',
   'vinhomes-grand-park', 'Vinhomes Grand Park', 'Vinhomes',
   'TP. Thủ Đức', 'TP.HCM', 'mid-range', 'selling', 55,
   '{"amenities":["công viên","gym","trường học"]}'::jsonb, 'public')
on conflict (id) do nothing;

-- Knowledge map for the public demo project (Gladia) -------------------------
insert into map_nodes (id, org_id, project_id, label, kind, note) values
  ('00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Gladia by The Water','concept','Dự án trung tâm'),
  ('00000000-0000-0000-0000-00000000b002','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Vị trí ven sông Sài Gòn','location','Mặt tiền sông, view thoáng'),
  ('00000000-0000-0000-0000-00000000b003','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Công viên ven sông','amenity',null),
  ('00000000-0000-0000-0000-00000000b004','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Hồ bơi','amenity',null),
  ('00000000-0000-0000-0000-00000000b005','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Phân khúc hạng sang','selling_point','Khách tài chính mạnh, đề cao trải nghiệm'),
  ('00000000-0000-0000-0000-00000000b006','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Chủ đầu tư Masterise','selling_point','Uy tín, bàn giao cao cấp'),
  ('00000000-0000-0000-0000-00000000b007','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','An ninh 24/7','amenity',null)
on conflict (id) do nothing;

insert into map_edges (id, org_id, project_id, source_id, target_id, kind) values
  ('00000000-0000-0000-0000-00000000c001','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-00000000b002','part_of'),
  ('00000000-0000-0000-0000-00000000c002','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b002','00000000-0000-0000-0000-00000000b003','near'),
  ('00000000-0000-0000-0000-00000000c003','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-00000000b004','part_of'),
  ('00000000-0000-0000-0000-00000000c004','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b002','00000000-0000-0000-0000-00000000b005','supports'),
  ('00000000-0000-0000-0000-00000000c005','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b006','00000000-0000-0000-0000-00000000b005','supports'),
  ('00000000-0000-0000-0000-00000000c006','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-00000000b007','part_of')
on conflict (id) do nothing;
