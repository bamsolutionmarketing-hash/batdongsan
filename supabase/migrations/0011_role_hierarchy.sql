-- 0011 Role hierarchy (super_admin) + admin-managed agent activation.
-- ('super_admin' enum value added in a prior standalone migration.)

-- ── profiles: activation + per-admin quotas ────────────────────────────────
alter table profiles add column if not exists is_active boolean not null default false;
alter table profiles add column if not exists managed_by uuid references profiles(id) on delete set null;
alter table profiles add column if not exists agent_quota int;   -- admins: max ACTIVE agents
alter table profiles add column if not exists daily_quota int;   -- admins: posts+scripts/day for their agents (null = unlimited)
create index if not exists idx_profiles_managed_by on profiles(managed_by);

-- ── role helpers: is_admin() now = staff (admin|super); is_super() = super ─
create or replace function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('admin','super_admin') from profiles where id = auth.uid()), false)
$$;
create or replace function is_super() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from profiles where id = auth.uid()), false)
$$;

-- ── content is editable by SUPER only (admins manage agents, not content) ──
drop policy if exists developers_admin on developers;
create policy developers_admin on developers for all using (is_super()) with check (is_super());
drop policy if exists projects_admin on projects;
create policy projects_admin on projects for all using (is_super()) with check (is_super());
drop policy if exists nodes_admin on knowledge_nodes;
create policy nodes_admin on knowledge_nodes for all using (is_super()) with check (is_super());
drop policy if exists links_admin on knowledge_links;
create policy links_admin on knowledge_links for all using (is_super()) with check (is_super());
drop policy if exists assets_admin on node_assets;
create policy assets_admin on node_assets for all using (is_super()) with check (is_super());
drop policy if exists triggers_admin on time_triggers;
create policy triggers_admin on time_triggers for all using (is_super()) with check (is_super());

-- super can read/update every profile (manage roles + quotas)
drop policy if exists profiles_super_all on profiles;
create policy profiles_super_all on profiles for all using (is_super()) with check (is_super());

-- ── RPCs (SECURITY DEFINER): centralize auth + quota; called with user JWT ──

-- Admin activates/deactivates an agent by email; enforces active-agent quota.
create or replace function admin_activate_agent(p_email text, p_active boolean)
returns text language plpgsql security definer set search_path = public as $$
declare caller uuid := auth.uid(); caller_role text; target uuid; target_role text; quota int; active_count int;
begin
  select role into caller_role from profiles where id = caller;
  if caller_role not in ('admin','super_admin') then raise exception 'Không có quyền kích hoạt'; end if;
  select id into target from auth.users where lower(email) = lower(p_email);
  if target is null then raise exception 'Không tìm thấy tài khoản với email này'; end if;
  select role into target_role from profiles where id = target;
  if target_role <> 'agent' then raise exception 'Email này không phải agent'; end if;
  if p_active then
    select agent_quota into quota from profiles where id = caller;
    select count(*) into active_count from profiles where managed_by = caller and is_active and id <> target;
    if quota is not null and active_count >= quota then raise exception 'Đã đạt giới hạn % agent đang active', quota; end if;
    update profiles set is_active = true, managed_by = caller where id = target;
  else
    update profiles set is_active = false where id = target and managed_by = caller;
    if not found then raise exception 'Agent không thuộc quản lý của bạn'; end if;
  end if;
  return 'ok';
end $$;

-- Super promotes a user to admin and sets their quotas (by email).
create or replace function super_promote_admin(p_email text, p_agent_quota int, p_daily_quota int)
returns text language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  if not is_super() then raise exception 'Chỉ super admin'; end if;
  select id into target from auth.users where lower(email) = lower(p_email);
  if target is null then raise exception 'Không tìm thấy user với email này'; end if;
  update profiles set role = 'admin', agent_quota = p_agent_quota, daily_quota = p_daily_quota where id = target;
  return 'ok';
end $$;

-- Caller admin's managed agents (with email).
create or replace function list_my_agents()
returns table(email text, full_name text, is_active boolean) language plpgsql security definer set search_path = public as $$
begin
  if (select role from profiles where id = auth.uid()) not in ('admin','super_admin') then raise exception 'Không có quyền'; end if;
  return query
    select u.email::text, p.full_name, p.is_active
    from profiles p join auth.users u on u.id = p.id
    where p.managed_by = auth.uid()
    order by p.is_active desc, u.email;
end $$;

-- Super: all admins with quotas + current active-agent count.
create or replace function list_admins()
returns table(email text, full_name text, agent_quota int, daily_quota int, active_count bigint) language plpgsql security definer set search_path = public as $$
begin
  if not is_super() then raise exception 'Chỉ super admin'; end if;
  return query
    select u.email::text, p.full_name, p.agent_quota, p.daily_quota,
           (select count(*) from profiles a where a.managed_by = p.id and a.is_active)
    from profiles p join auth.users u on u.id = p.id
    where p.role = 'admin'
    order by u.email;
end $$;

grant execute on function admin_activate_agent(text, boolean) to authenticated;
grant execute on function super_promote_admin(text, int, int) to authenticated;
grant execute on function list_my_agents() to authenticated;
grant execute on function list_admins() to authenticated;
