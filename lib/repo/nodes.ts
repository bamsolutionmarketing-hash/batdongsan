import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result, type KnowledgeNode, type KnowledgeLink, type Fact } from "@/types/domain";

interface NodeRow {
  id: string;
  project_id: string;
  node_key: string;
  label: string;
  category: string;
  sub_label: string | null;
  facts: Fact[] | null;
  talkpoint: string | null;
  description: string | null;
  sort_order: number;
}
interface LinkRow {
  id: string;
  project_id: string;
  source_node: string;
  target_node: string;
  label: string | null;
}

const toNode = (r: NodeRow): KnowledgeNode => ({
  id: r.id,
  projectId: r.project_id,
  nodeKey: r.node_key,
  label: r.label,
  category: r.category,
  subLabel: r.sub_label,
  facts: r.facts ?? [],
  talkpoint: r.talkpoint,
  description: r.description,
  sortOrder: r.sort_order,
});

const toLink = (r: LinkRow): KnowledgeLink => ({
  id: r.id,
  projectId: r.project_id,
  sourceNode: r.source_node,
  targetNode: r.target_node,
  label: r.label,
});

// Enabled nodes of a project (RLS scopes to demo/published).
export async function nodesByProject(projectId: string): Promise<Result<KnowledgeNode[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_nodes")
    .select("id, project_id, node_key, label, category, sub_label, facts, talkpoint, description, sort_order")
    .eq("project_id", projectId)
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true })
    .limit(500);
  if (error) return err("INTERNAL", error.message);
  return ok((data as NodeRow[]).map(toNode));
}

// Admin variant: include disabled nodes (the editor needs to see everything).
export async function nodesByProjectAll(projectId: string): Promise<Result<KnowledgeNode[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_nodes")
    .select("id, project_id, node_key, label, category, sub_label, facts, talkpoint, description, sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .limit(1000);
  if (error) return err("INTERNAL", error.message);
  return ok((data as NodeRow[]).map(toNode));
}

// Enabled nodes by id list (preserves caller order). For createPost / caption.
export async function nodesByIds(ids: string[]): Promise<Result<KnowledgeNode[]>> {
  if (ids.length === 0) return ok([]);
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_nodes")
    .select("id, project_id, node_key, label, category, sub_label, facts, talkpoint, description, sort_order")
    .in("id", ids)
    .eq("is_enabled", true);
  if (error) return err("INTERNAL", error.message);
  const byId = new Map((data as NodeRow[]).map((r) => [r.id, toNode(r)]));
  return ok(ids.map((id) => byId.get(id)).filter((n): n is KnowledgeNode => Boolean(n)));
}

export async function getNodeById(id: string): Promise<Result<KnowledgeNode | null>> {
  if (!isSupabaseConfigured()) return ok(null);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_nodes")
    .select("id, project_id, node_key, label, category, sub_label, facts, talkpoint, description, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (error) return err("INTERNAL", error.message);
  return ok(data ? toNode(data as NodeRow) : null);
}

export async function linksByProject(projectId: string): Promise<Result<KnowledgeLink[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_links")
    .select("id, project_id, source_node, target_node, label")
    .eq("project_id", projectId)
    .limit(1000);
  if (error) return err("INTERNAL", error.message);
  return ok((data as LinkRow[]).map(toLink));
}

// Candidate nodes for "Hôm Nay" suggestions: enabled nodes of published
// projects, with project slug. (RLS already scopes to visible projects.)
export async function candidateNodes(): Promise<
  Result<{ id: string; label: string; category: string; projectId: string; projectSlug: string }[]>
> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("knowledge_nodes")
    .select("id, label, category, project_id, projects!inner(slug, is_published)")
    .eq("is_enabled", true)
    .eq("projects.is_published", true)
    .limit(2000);
  if (error) return err("INTERNAL", error.message);
  return ok(
    (data as any[]).map((r) => ({
      id: r.id,
      label: r.label,
      category: r.category,
      projectId: r.project_id,
      projectSlug: r.projects.slug,
    })),
  );
}
