-- 0015 Per-project access (open/unlock projects).
--   paid=false  → included slot (tied to tier: free 1 / pro 3) — no expiry
--   paid=true   → monthly purchase (expires_at = +30d, renewable)
-- Sub-agents also inherit their managing admin's pool (read policy below).
-- Admins curate a pool within profiles.project_quota (set by super admin).

alter table profiles add column if not exists project_quota int; -- admins: pool size

create table if not exists project_access (
  user_id uuid not null references profiles(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  paid boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, project_id)
);
create index if not exists idx_project_access_user on project_access(user_id, created_at);

alter table project_access enable row level security;
drop policy if exists project_access_rw on project_access;
create policy project_access_rw on project_access for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- A managed sub-agent may READ their managing admin's pool rows.
drop policy if exists project_access_pool_read on project_access;
create policy project_access_pool_read on project_access for select
  using (user_id = (select managed_by from profiles where id = auth.uid()));
