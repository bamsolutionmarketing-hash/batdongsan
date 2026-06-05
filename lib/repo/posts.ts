import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/types/domain";

export interface GeneratedPost {
  id: string;
  projectId: string;
  nodeIds: string[];
  caption: string;
  promptVersion: string | null;
  createdAt: string;
}

interface PostRow {
  id: string;
  project_id: string;
  node_ids: string[];
  caption: string;
  prompt_version: string | null;
  created_at: string;
}

const toPost = (r: PostRow): GeneratedPost => ({
  id: r.id,
  projectId: r.project_id,
  nodeIds: r.node_ids,
  caption: r.caption,
  promptVersion: r.prompt_version,
  createdAt: r.created_at,
});

// A post by id (RLS: own rows / admin).
export async function getPostById(id: string): Promise<Result<GeneratedPost | null>> {
  if (!isSupabaseConfigured()) return ok(null);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_posts")
    .select("id, project_id, node_ids, caption, prompt_version, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return err("INTERNAL", error.message);
  return ok(data ? toPost(data as PostRow) : null);
}

// Recent posts of a user (for streak + variety + "share yesterday").
export async function listRecentPosts(
  userId: string,
  limit = 14,
): Promise<Result<{ createdAt: string; nodeIds: string[] }[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_posts")
    .select("created_at, node_ids")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return err("INTERNAL", error.message);
  return ok((data as { created_at: string; node_ids: string[] }[]).map((r) => ({
    createdAt: r.created_at,
    nodeIds: r.node_ids ?? [],
  })));
}
