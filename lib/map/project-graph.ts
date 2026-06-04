import { valueFromDegree } from "./transform";
import type { GraphData, GraphNode, GraphLink } from "../data/types";

export interface MapNodeRow {
  id: string;
  label: string;
  kind: string;
  note: string | null;
}
export interface MapEdgeRow {
  id: string;
  source_id: string;
  target_id: string;
  kind: string;
}

// Node kinds -> colour + Vietnamese label, for the per-project knowledge graph.
export const NODE_KIND_COLORS: Record<string, string> = {
  concept: "#94a3b8",
  amenity: "#34d399",
  selling_point: "#f59e0b",
  location: "#38bdf8",
  legal: "#f472b6",
  zone: "#a78bfa",
  related: "#fb7185",
  // Rich knowledge-map kinds (project dossier): developers, certifications,
  // transit, road infrastructure, comparable projects, policy.
  project: "#d4a544",
  developer: "#58a6ff",
  cert: "#a371f7",
  metro: "#3fb950",
  road: "#f0883e",
  comparable: "#f85149",
  policy: "#8b949e",
  // Masterise/township dossier kinds: group, brand, partners, masterplan,
  // sub-zones/clusters, community events, infrastructure, finance/market.
  group: "#2d9cae",
  brand: "#4a9fd8",
  partner: "#a978f0",
  masterplan: "#39c5a8",
  cluster: "#e072b0",
  event: "#e6c068",
  infra: "#f0883e",
  finance: "#45c463",
};

export const NODE_KIND_LABEL: Record<string, string> = {
  concept: "Khái niệm",
  amenity: "Tiện ích",
  selling_point: "Điểm bán hàng",
  location: "Vị trí",
  legal: "Pháp lý",
  zone: "Phân khu",
  related: "Dự án liên quan",
  project: "Dự án",
  developer: "Chủ đầu tư",
  cert: "Chứng nhận",
  metro: "Metro / Đường sắt",
  road: "Đường bộ / Cầu",
  comparable: "So sánh BĐS",
  policy: "Chính sách",
  group: "Tập đoàn",
  brand: "Thương hiệu",
  partner: "Đối tác",
  masterplan: "Khu đô thị",
  cluster: "Phân khu",
  event: "Sự kiện",
  infra: "Hạ tầng",
  finance: "Tài chính",
};

export const EDGE_KIND_COLORS: Record<string, string> = {
  relates: "rgba(148,163,184,0.5)",
  part_of: "#a78bfa",
  near: "#38bdf8",
  supports: "#f59e0b",
};

// Build force-graph data from a project's stored nodes/edges, with degree-based
// sizing (same Obsidian sizing as the cross-project map). Pure + tested.
export function buildProjectGraph(nodes: MapNodeRow[], edges: MapEdgeRow[]): GraphData {
  const ids = new Set(nodes.map((n) => n.id));
  const degree = new Map<string, number>(nodes.map((n) => [n.id, 0]));

  const links: GraphLink[] = [];
  for (const e of edges) {
    // Skip edges whose endpoints are missing (defensive against stale rows).
    if (!ids.has(e.source_id) || !ids.has(e.target_id)) continue;
    links.push({ source: e.source_id, target: e.target_id, group: e.kind });
    degree.set(e.source_id, (degree.get(e.source_id) ?? 0) + 1);
    degree.set(e.target_id, (degree.get(e.target_id) ?? 0) + 1);
  }

  const graphNodes: GraphNode[] = nodes.map((n) => {
    const d = degree.get(n.id) ?? 0;
    return { id: n.id, label: n.label, group: n.kind, degree: d, val: valueFromDegree(d) };
  });

  return { nodes: graphNodes, links };
}
