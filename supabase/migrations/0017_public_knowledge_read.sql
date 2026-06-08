-- Public knowledge maps: make PUBLISHED projects' info (project row + knowledge
-- nodes/links) world-readable so the public /kmap viewer works for anonymous
-- visitors. Drops the previous "is_demo OR authenticated" restriction — info is
-- free; content generation (node_content_blocks) and writes stay gated.

drop policy if exists projects_read on projects;
create policy projects_read on projects for select using (
  is_admin() or is_published = true
);

drop policy if exists nodes_read on knowledge_nodes;
create policy nodes_read on knowledge_nodes for select using (
  is_admin() or exists (
    select 1 from projects p
    where p.id = knowledge_nodes.project_id and p.is_published = true)
);

drop policy if exists links_read on knowledge_links;
create policy links_read on knowledge_links for select using (
  is_admin() or exists (
    select 1 from projects p
    where p.id = knowledge_links.project_id and p.is_published = true)
);
