// Core domain types for the BĐS (real-estate) map + guidance engine.

export type Segment = "luxury" | "high-end" | "mid-range" | "affordable";

export type ProjectStatus = "planning" | "selling" | "handover" | "completed";

export interface Project {
  id: string;
  name: string;
  developer: string;
  district: string;
  city: string;
  segment: Segment;
  status: ProjectStatus;
  /** Average price in million VND per m². */
  pricePerSqmM: number;
  /** Optional explicit relations to other project ids (e.g. same complex). */
  relatedIds?: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  segment: Segment;
  /** Visual weight, derived (e.g. from price). */
  val: number;
}

export type LinkReason = "same-developer" | "same-district" | "same-segment" | "related";

export interface GraphLink {
  source: string;
  target: string;
  reason: LinkReason;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type GuidanceLevel = "info" | "tip" | "warning";

export interface GuidanceItem {
  id: string;
  level: GuidanceLevel;
  title: string;
  detail: string;
}

export interface GuidanceResult {
  projectId: string;
  items: GuidanceItem[];
}
