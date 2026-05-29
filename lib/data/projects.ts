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

// Projects plus an id->slug map, so UIs can link to the learning hub without
// widening the shared Project type.
export async function listProjectsWithSlug(): Promise<{
  projects: Project[];
  slugById: Record<string, string>;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .order("created_at", { ascending: true });
  if (error) throw error;
  const rows = data as ProjectRow[];
  const slugById: Record<string, string> = {};
  rows.forEach((r) => (slugById[r.id] = r.slug));
  return { projects: rows.map(rowToProject), slugById };
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

// Average price/m² of other visible projects in a district (excludes `exceptId`).
// Returns undefined when there are no priced peers.
export async function districtAveragePrice(
  district: string,
  exceptId: string,
): Promise<number | undefined> {
  if (!district) return undefined;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, price_per_sqm_m")
    .eq("district", district);
  if (error) throw error;
  const peers = (data ?? []).filter(
    (r) => r.id !== exceptId && typeof r.price_per_sqm_m === "number" && r.price_per_sqm_m > 0,
  );
  if (peers.length === 0) return undefined;
  return peers.reduce((s, r) => s + (r.price_per_sqm_m as number), 0) / peers.length;
}

export interface ProjectDetail extends Project {
  slug: string;
  amenities: string[];
  highlights: string[];
  visibility: "org" | "public";
}

// Full project for the learning hub (includes attributes the map doesn't need).
export async function getProjectDetailBySlug(slug: string): Promise<ProjectDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as ProjectRow;
  return {
    ...rowToProject(row),
    slug: row.slug,
    amenities: row.attributes?.amenities ?? [],
    highlights: row.attributes?.highlights ?? [],
    visibility: row.visibility,
  };
}

export interface ProvenanceItem {
  field: string;
  value: string;
  source_span: string | null;
}

// Confirmed extractions for a project — the audit trail shown on the learning
// hub so a salesperson sees where each fact came from.
export async function getProjectProvenance(projectId: string): Promise<ProvenanceItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("extractions")
    .select("field, value, source_span")
    .eq("project_id", projectId)
    .eq("status", "confirmed")
    .order("field", { ascending: true });
  if (error) throw error;
  return (data as ProvenanceItem[]) ?? [];
}
