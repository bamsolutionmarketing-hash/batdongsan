import { valueFromDegree } from "./transform";
import type { GraphData, GraphLink, GraphNode } from "@/lib/data/types";
import type { KnowledgeNode, KnowledgeLink } from "@/types/domain";

export interface NodeNote {
  label: string;
  kind: string; // category
  note: string | null;
}
export interface ProjectGraph {
  graph: GraphData;
  notesById: Record<string, NodeNote>;
}

// Free-text link label → coarse edge kind (drives edge colour in the map).
export function edgeKind(label: string | null): string {
  const l = (label ?? "").toLowerCase();
  if (/(thuộc|gồm|phân khu|phân khúc|dòng|mặt tiền|tọa lạc|quy hoạch|kiến trúc|thiết kế|tiện ích|cảnh quan|cụm|hạng|biến thể|cấp bởi|điểm đầu|điểm cuối)/.test(l))
    return "part_of";
  if (/(gần|cạnh|liền kề|lân cận|km|phút|giao|đi qua|kết nối|qua|nối|tới|cửa ngõ|tuyến|view|ga|điểm đến|liên kết)/.test(l))
    return "near";
  if (/(chủ đầu tư|cổ đông|đầu tư|đạt|cam kết|tác động|theo|quản lý|vận hành|hợp tác|sở hữu|đặt lõi|mảng|tiền thân|chính sách|vĩ mô|bối cảnh|hưởng lợi|động lực)/.test(l))
    return "supports";
  return "relates";
}

// Compose the focus-panel note from facts + description + talking point.
function composeNote(n: KnowledgeNode): string | null {
  const parts: string[] = [];
  if (n.subLabel) parts.push(n.subLabel);
  if (n.facts.length) parts.push(n.facts.map((f) => `${f.key}: ${f.value}`).join(" · "));
  if (n.description) parts.push(n.description);
  if (n.talkpoint) parts.push(`★ ${n.talkpoint}`);
  return parts.length ? parts.join("\n\n") : null;
}

// Build force-graph data from a project's knowledge nodes/links. Pure.
// group = category (node colour); link group = coarse edge kind.
export function buildGraph(nodes: KnowledgeNode[], links: KnowledgeLink[]): ProjectGraph {
  const ids = new Set(nodes.map((n) => n.id));
  const degree = new Map<string, number>(nodes.map((n) => [n.id, 0]));

  const graphLinks: GraphLink[] = [];
  for (const e of links) {
    if (!ids.has(e.sourceNode) || !ids.has(e.targetNode)) continue; // defensive
    graphLinks.push({ source: e.sourceNode, target: e.targetNode, group: edgeKind(e.label) });
    degree.set(e.sourceNode, (degree.get(e.sourceNode) ?? 0) + 1);
    degree.set(e.targetNode, (degree.get(e.targetNode) ?? 0) + 1);
  }

  const notesById: Record<string, NodeNote> = {};
  const graphNodes: GraphNode[] = nodes.map((n) => {
    const d = degree.get(n.id) ?? 0;
    notesById[n.id] = { label: n.label, kind: n.category, note: composeNote(n) };
    return { id: n.id, label: n.label, group: n.category, degree: d, val: valueFromDegree(d) };
  });

  return { graph: { nodes: graphNodes, links: graphLinks }, notesById };
}
