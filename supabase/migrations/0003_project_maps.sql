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
