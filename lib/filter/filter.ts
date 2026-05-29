import type { Project, ProjectStatus, Segment } from "../data/types";

export interface FilterCriteria {
  query?: string;
  segments?: Segment[];
  districts?: string[];
  developers?: string[];
  statuses?: ProjectStatus[];
}

export interface Facets {
  segments: Segment[];
  districts: string[];
  developers: string[];
  statuses: ProjectStatus[];
}

export interface FilterResult {
  visible: Project[];
  /** Ids within `visible` that match the text query (empty when no query). */
  highlightIds: string[];
}

// Accent-insensitive, lowercase form for Vietnamese-friendly matching.
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
}

function inList<T>(value: T, list?: T[]): boolean {
  return !list || list.length === 0 || list.includes(value);
}

// AND across categories, OR within a category. Empty list = no constraint.
export function matchesFacets(project: Project, criteria: FilterCriteria): boolean {
  return (
    inList(project.segment, criteria.segments) &&
    inList(project.district, criteria.districts) &&
    inList(project.developer, criteria.developers) &&
    inList(project.status, criteria.statuses)
  );
}

export function searchMatches(project: Project, query: string): boolean {
  const q = normalizeText(query);
  if (q === "") return true;
  return normalizeText(project.name).includes(q);
}

function distinct<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export function collectFacets(projects: Project[]): Facets {
  const sorted = <T>(vals: T[]) => distinct(vals).sort();
  return {
    segments: sorted(projects.map((p) => p.segment)),
    districts: sorted(projects.map((p) => p.district)),
    developers: sorted(projects.map((p) => p.developer)),
    statuses: sorted(projects.map((p) => p.status)),
  };
}

export function applyFilters(projects: Project[], criteria: FilterCriteria): FilterResult {
  const visible = projects.filter((p) => matchesFacets(p, criteria));
  const query = criteria.query ?? "";
  const highlightIds =
    normalizeText(query) === ""
      ? []
      : visible.filter((p) => searchMatches(p, query)).map((p) => p.id);
  return { visible, highlightIds };
}
