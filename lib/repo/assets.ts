import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, err, type Result } from "@/types/domain";

export interface NodeAsset {
  id: string;
  nodeId: string;
  storagePath: string;
  signedUrl: string | null;
  safeZone: string;
  sortOrder: number;
}

interface AssetRow {
  id: string;
  node_id: string;
  storage_path: string;
  safe_zone: string;
  sort_order: number;
}

// Admin listing: rows + short-lived signed preview URLs (bucket is private).
export async function assetsByNode(nodeId: string): Promise<Result<NodeAsset[]>> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch (e) {
    return err("INTERNAL", (e as Error).message);
  }
  const { data, error } = await supabase
    .from("node_assets")
    .select("id, node_id, storage_path, safe_zone, sort_order")
    .eq("node_id", nodeId)
    .order("sort_order", { ascending: true });
  if (error) return err("INTERNAL", error.message);

  const rows = data as AssetRow[];
  const out: NodeAsset[] = [];
  for (const r of rows) {
    const { data: signed } = await supabase.storage
      .from("assets")
      .createSignedUrl(r.storage_path, 3600);
    out.push({
      id: r.id,
      nodeId: r.node_id,
      storagePath: r.storage_path,
      signedUrl: signed?.signedUrl ?? null,
      safeZone: r.safe_zone,
      sortOrder: r.sort_order,
    });
  }
  return ok(out);
}
