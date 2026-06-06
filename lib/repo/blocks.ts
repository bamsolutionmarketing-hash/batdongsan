import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, err, type Result, type ContentBlock } from "@/types/domain";

// node_content_blocks is RLS server-only (no client policy) — these reads/writes
// MUST use the service-role client. Caller is responsible for admin gating.

interface BlockRow {
  id: string;
  node_id: string;
  role: ContentBlock["role"];
  variant_no: number;
  text: string;
  tone: ContentBlock["tone"];
  min_confidence: ContentBlock["minConfidence"];
  fact_keys: string[] | null;
  is_enabled: boolean;
}

const toBlock = (r: BlockRow): ContentBlock => ({
  id: r.id,
  nodeId: r.node_id,
  role: r.role,
  variantNo: r.variant_no,
  text: r.text,
  tone: r.tone,
  minConfidence: r.min_confidence,
  factKeys: r.fact_keys ?? [],
  isEnabled: r.is_enabled,
});

// Enabled BODY blocks for several nodes at once (source of the video script
// body when the agent picks map nodes).
export async function bodyBlocksByNodes(nodeIds: string[]): Promise<Result<Map<string, ContentBlock[]>>> {
  const m = new Map<string, ContentBlock[]>();
  if (nodeIds.length === 0) return ok(m);
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return err("INTERNAL", (e as Error).message);
  }
  const { data, error } = await supabase
    .from("node_content_blocks")
    .select("id, node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled")
    .in("node_id", nodeIds)
    .eq("role", "body")
    .eq("is_enabled", true)
    .order("variant_no", { ascending: true });
  if (error) return err("INTERNAL", error.message);
  for (const r of data as BlockRow[]) {
    const b = toBlock(r);
    m.set(b.nodeId, [...(m.get(b.nodeId) ?? []), b]);
  }
  return ok(m);
}

export async function blocksByNode(nodeId: string): Promise<Result<ContentBlock[]>> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return err("INTERNAL", (e as Error).message);
  }
  const { data, error } = await supabase
    .from("node_content_blocks")
    .select("id, node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled")
    .eq("node_id", nodeId)
    .order("role", { ascending: true })
    .order("variant_no", { ascending: true });
  if (error) return err("INTERNAL", error.message);
  return ok((data as BlockRow[]).map(toBlock));
}
