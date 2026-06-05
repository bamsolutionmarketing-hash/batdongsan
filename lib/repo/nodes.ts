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
