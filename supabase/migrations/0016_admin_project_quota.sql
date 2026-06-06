-- 0016 Super admin sets a per-admin project pool size (project_quota).
-- Extend super_promote_admin + list_admins to carry project_quota.

drop function if exists super_promote_admin(text, int, int);
create or replace function super_promote_admin(p_email text, p_agent_quota int, p_daily_quota int, p_project_quota int)
returns text language plpgsql security definer set search_path = public as $$
declare target uuid;
begin
  if not is_super() then raise exception 'Chỉ super admin'; end if;
  select id into target from auth.users where lower(email) = lower(p_email);
  if target is null then raise exception 'Không tìm thấy user với email này'; end if;
  update profiles set role = 'admin', agent_quota = p_agent_quota, daily_quota = p_daily_quota, project_quota = p_project_quota where id = target;
  return 'ok';
end $$;
grant execute on function super_promote_admin(text, int, int, int) to authenticated;

drop function if exists list_admins();
create function list_admins()
returns table(email text, full_name text, agent_quota int, daily_quota int, project_quota int, active_count bigint) language plpgsql security definer set search_path = public as $$
begin
  if not is_super() then raise exception 'Chỉ super admin'; end if;
  return query
    select u.email::text, p.full_name, p.agent_quota, p.daily_quota, p.project_quota,
           (select count(*) from profiles a where a.managed_by = p.id and a.is_active)
    from profiles p join auth.users u on u.id = p.id
    where p.role = 'admin'
    order by u.email;
end $$;
grant execute on function list_admins() to authenticated;
