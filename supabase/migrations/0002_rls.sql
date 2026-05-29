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

-- profiles: a user reads profiles in their org; users manage their own row. --
create policy profiles_read on profiles
  for select using (org_id = auth_org_id() or user_id = auth.uid());
create policy profiles_self_upsert on profiles
  for insert with check (user_id = auth.uid());
create policy profiles_self_update on profiles
  for update using (user_id = auth.uid());

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
