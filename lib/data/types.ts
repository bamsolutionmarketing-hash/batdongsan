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
  /** Generic grouping key for colouring (e.g. segment, or concept kind). */
  group: string;
  /** Number of links this node has — drives Obsidian-style sizing. */
  degree: number;
  /** Visual weight, derived from degree. */
  val: number;
}

export type LinkReason = "same-developer" | "same-district" | "same-segment" | "related";

export interface GraphLink {
  source: string;
  target: string;
  /** Grouping key for link colour (relation type, or concept-edge kind). */
  group: string;
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
