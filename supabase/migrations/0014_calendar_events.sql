-- 0014 Personal calendar events: pick a day, note an event (optionally tied to
-- a project). Shown on the calendar only (not the dashboard).
create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  event_date date not null,
  title text not null,
  note text,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists idx_calendar_events_user_date on calendar_events(user_id, event_date);

alter table calendar_events enable row level security;
drop policy if exists calendar_events_rw on calendar_events;
create policy calendar_events_rw on calendar_events for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
