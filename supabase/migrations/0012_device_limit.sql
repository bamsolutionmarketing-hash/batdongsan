-- 0012 Device limit: max 2 active devices for agent + admin (super exempt).
-- A device = a persistent cookie id. Slot frees on logout or 30d inactivity.

create table if not exists user_devices (
  user_id uuid not null references profiles(id) on delete cascade,
  device_id text not null,                 -- persistent cookie value
  user_agent text,
  ip text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (user_id, device_id)
);
create index if not exists idx_devices_user_active on user_devices(user_id, last_seen_at) where revoked_at is null;

alter table user_devices enable row level security;
drop policy if exists devices_rw on user_devices;
create policy devices_rw on user_devices for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Per-request enforcement. Returns: 'ok' (proceed), 'revoked' (sign out this
-- device), or 'choose' (over limit → pick a device to evict). Super admins and
-- non-staff are exempt. Counts a device inactive once revoked or idle > 30 days.
create or replace function device_check(p_device_id text, p_user_agent text, p_ip text)
returns text language plpgsql security definer set search_path = public as $$
declare
  caller uuid := auth.uid();
  caller_role text;
  active_count int;
  v_revoked boolean;
  v_last timestamptz;
begin
  if caller is null then return 'ok'; end if;
  select role into caller_role from profiles where id = caller;
  -- only agent + admin are limited; super_admin (and anything else) exempt
  if caller_role is null or caller_role not in ('agent','admin') then return 'ok'; end if;

  select (revoked_at is not null), last_seen_at into v_revoked, v_last
    from user_devices where user_id = caller and device_id = p_device_id;

  if found then
    if v_revoked then return 'revoked'; end if;
    if v_last >= now() - interval '30 days' then
      update user_devices set last_seen_at = now(), ip = p_ip, user_agent = p_user_agent
        where user_id = caller and device_id = p_device_id;
      return 'ok';
    end if;
    -- else: idle > 30d → treat as new registration (fall through)
  end if;

  select count(*) into active_count from user_devices
    where user_id = caller and device_id <> p_device_id
      and revoked_at is null and last_seen_at > now() - interval '30 days';
  if active_count >= 2 then return 'choose'; end if;

  insert into user_devices (user_id, device_id, user_agent, ip, created_at, last_seen_at, revoked_at)
    values (caller, p_device_id, p_user_agent, p_ip, now(), now(), null)
  on conflict (user_id, device_id) do update
    set last_seen_at = now(), revoked_at = null, ip = excluded.ip, user_agent = excluded.user_agent;
  return 'ok';
end $$;

grant execute on function device_check(text, text, text) to authenticated;
