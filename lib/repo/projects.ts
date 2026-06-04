import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result, type Project } from "@/types/domain";

const COLUMNS =
  "id, developer_id, name, slug, phase, location_text, status, price_min, price_max, view360_url, thumbnail_url, is_demo, is_published";

interface ProjectRow {
  id: string;
  developer_id: string | null;
  name: string;
  slug: string;
  phase: string | null;
  location_text: string | null;
  status: string | null;
  price_min: number | null;
  price_max: number | null;
  view360_url: string | null;
  thumbnail_url: string | null;
  is_demo: boolean;
  is_published: boolean;
}

const toProject = (r: ProjectRow): Project => ({
  id: r.id,
  developerId: r.developer_id,
  name: r.name,
  slug: r.slug,
  phase: r.phase,
  locationText: r.location_text,
  status: r.status,
  priceMin: r.price_min,
  priceMax: r.price_max,
  view360Url: r.view360_url,
  thumbnailUrl: r.thumbnail_url,
  isDemo: r.is_demo,
  isPublished: r.is_published,
});

// Published projects (RLS scopes anon→demo, authed→all published).
export async function listPublishedProjects(): Promise<Result<Project[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("is_published", true)
    .order("name", { ascending: true })
    .limit(100);
  if (error) return err("INTERNAL", error.message);
  return ok((data as ProjectRow[]).map(toProject));
}

// All projects the caller may see (admin → every project via RLS). Used by the
// admin list; ordered newest first.
export async function listAllProjects(): Promise<Result<Project[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return err("INTERNAL", error.message);
  return ok((data as ProjectRow[]).map(toProject));
}

export async function getProjectBySlug(slug: string): Promise<Result<Project | null>> {
  if (!isSupabaseConfigured()) return ok(null);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) return err("INTERNAL", error.message);
  return ok(data ? toProject(data as ProjectRow) : null);
}
