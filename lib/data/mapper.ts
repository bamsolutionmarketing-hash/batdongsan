import type { Project, ProjectStatus, Segment } from "./types";

// Shape of a `projects` row as returned by Supabase.
export interface ProjectRow {
  id: string;
  org_id: string;
  slug: string;
  name: string;
  developer: string | null;
  district: string | null;
  city: string | null;
  segment: string | null;
  status: string | null;
  price_per_sqm_m: number | null;
  attributes: { relatedIds?: string[]; amenities?: string[]; highlights?: string[] } | null;
  visibility: "org" | "public";
}

const SEGMENTS: Segment[] = ["luxury", "high-end", "mid-range", "affordable"];
const STATUSES: ProjectStatus[] = ["planning", "selling", "handover", "completed"];

function asSegment(v: string | null): Segment {
  return SEGMENTS.includes(v as Segment) ? (v as Segment) : "mid-range";
}

function asStatus(v: string | null): ProjectStatus {
  return STATUSES.includes(v as ProjectStatus) ? (v as ProjectStatus) : "selling";
}

// Convert a DB row into the in-memory Project the engine/map/filter expect.
export function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    developer: row.developer ?? "",
    district: row.district ?? "",
    city: row.city ?? "",
    segment: asSegment(row.segment),
    status: asStatus(row.status),
    pricePerSqmM: row.price_per_sqm_m ?? 0,
    relatedIds: row.attributes?.relatedIds ?? [],
  };
}
