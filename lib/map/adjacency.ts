import type { GraphData } from "../data/types";

export interface Adjacency {
  /** node id -> set of directly-connected node ids */
  neighbors: Map<string, Set<string>>;
  /** "a|b" (a<b) -> true for every linked pair, for O(1) link lookups */
  linkKeys: Set<string>;
}

function linkEnd(end: string | { id: string }): string {
  return typeof end === "string" ? end : end.id;
}

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

// Precompute adjacency so hover/focus highlighting is O(1) per node/link,
// not O(links) — matters once a graph has thousands of projects.
export function buildAdjacency(data: GraphData): Adjacency {
  const neighbors = new Map<string, Set<string>>();
  const linkKeys = new Set<string>();
  for (const node of data.nodes) neighbors.set(node.id, new Set());

  for (const link of data.links) {
    const s = linkEnd(link.source as never);
    const t = linkEnd(link.target as never);
    neighbors.get(s)?.add(t);
    neighbors.get(t)?.add(s);
    linkKeys.add(pairKey(s, t));
  }
  return { neighbors, linkKeys };
}

// The focused node plus its direct neighbors (the highlighted subgraph).
export function neighborhood(adj: Adjacency, id: string | null): Set<string> {
  const set = new Set<string>();
  if (!id) return set;
  set.add(id);
  for (const n of adj.neighbors.get(id) ?? []) set.add(n);
  return set;
}
