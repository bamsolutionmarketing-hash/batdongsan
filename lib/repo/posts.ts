import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/types/domain";

export interface GeneratedPost {
  id: string;
  projectId: string;
  nodeIds: string[];
  caption: string;
  variantSeed: string;
  promptVersion: string | null;
  postedAt: string | null;
  createdAt: string;
}

interface PostRow {
  id: string;
  project_id: string;
  node_ids: string[];
  caption: string;
  variant_seed: string;
  prompt_version: string | null;
  posted_at: string | null;
  created_at: string;
}

const toPost = (r: PostRow): GeneratedPost => ({
  id: r.id,
  projectId: r.project_id,
  nodeIds: r.node_ids,
  caption: r.caption,
  variantSeed: r.variant_seed,
  promptVersion: r.prompt_version,
  postedAt: r.posted_at,
  createdAt: r.created_at,
});

// A post by id (RLS: own rows / admin).
export async function getPostById(id: string): Promise<Result<GeneratedPost | null>> {
  if (!isSupabaseConfigured()) return ok(null);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_posts")
    .select("id, project_id, node_ids, caption, variant_seed, prompt_version, posted_at, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return err("INTERNAL", error.message);
  return ok(data ? toPost(data as PostRow) : null);
}

// Recent posts of a user (for streak + variety + "share yesterday").
export async function listRecentPosts(
  userId: string,
  limit = 14,
): Promise<Result<{ createdAt: string; postedAt: string | null; nodeIds: string[] }[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_posts")
    .select("created_at, posted_at, node_ids")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return err("INTERNAL", error.message);
  return ok((data as { created_at: string; posted_at: string | null; node_ids: string[] }[]).map((r) => ({
    createdAt: r.created_at,
    postedAt: r.posted_at,
    nodeIds: r.node_ids ?? [],
  })));
}

// Library row: a post with its project name/slug for listing.
export interface PostListItem {
  id: string;
  projectId: string;
  projectName: string;
  projectSlug: string;
  caption: string;
  nodeIds: string[];
  postedAt: string | null;
  createdAt: string;
}

export async function listPosts(userId: string, limit = 100): Promise<Result<PostListItem[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_posts")
    .select("id, project_id, caption, node_ids, posted_at, created_at, projects(name, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return err("INTERNAL", error.message);
  type Row = {
    id: string; project_id: string; caption: string; node_ids: string[];
    posted_at: string | null; created_at: string;
    projects: { name: string; slug: string } | { name: string; slug: string }[] | null;
  };
  return ok((data as Row[]).map((r) => {
    const proj = Array.isArray(r.projects) ? r.projects[0] : r.projects;
    return {
      id: r.id,
      projectId: r.project_id,
      projectName: proj?.name ?? "Dự án",
      projectSlug: proj?.slug ?? "",
      caption: r.caption,
      nodeIds: r.node_ids ?? [],
      postedAt: r.posted_at,
      createdAt: r.created_at,
    };
  }));
}
