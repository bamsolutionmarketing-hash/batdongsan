import { createClient } from "@/lib/supabase/server";
import { rowToProject, type ProjectRow } from "./mapper";
import type { Project } from "./types";

const COLUMNS =
  "id, org_id, slug, name, developer, district, city, segment, status, price_per_sqm_m, attributes, visibility";

// Projects visible to the caller. RLS scopes this to their org + public rows;
// passing no session (anon) yields only public projects.
export async function listProjects(): Promise<Project[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as ProjectRow[]).map(rowToProject);
}

// Public projects only — used for the signed-out demo (no auth needed).
export async function listPublicProjects(): Promise<Project[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("visibility", "public")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as ProjectRow[]).map(rowToProject);
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToProject(data as ProjectRow) : null;
}
