import type { GraphData, GraphLink, GraphNode, LinkReason, Project } from "../data/types";

// Strongest relation between two projects, or null if they share nothing.
// Priority: explicit relation > developer > district > segment.
export function pairReason(a: Project, b: Project): LinkReason | null {
  if (a.relatedIds?.includes(b.id) || b.relatedIds?.includes(a.id)) return "related";
  if (a.developer === b.developer) return "same-developer";
  if (a.district === b.district) return "same-district";
  if (a.segment === b.segment) return "same-segment";
  return null;
}

// Node radius from its connection count (Obsidian-style: well-connected projects
// loom larger). Uses sqrt so highly-linked hubs don't dwarf everything.
export function valueFromDegree(degree: number): number {
  return Math.max(1, Math.round(Math.sqrt(degree) * 2));
}

// Convert a list of projects into force-graph nodes + links.
// Emits at most one link per unordered pair, labelled with its strongest reason;
// node size reflects degree (number of relations), like an Obsidian graph.
export function toGraphData(projects: Project[]): GraphData {
  const degree = new Map<string, number>(projects.map((p) => [p.id, 0]));
  const links: GraphLink[] = [];

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const reason = pairReason(projects[i], projects[j]);
      if (reason) {
        links.push({ source: projects[i].id, target: projects[j].id, reason });
        degree.set(projects[i].id, (degree.get(projects[i].id) ?? 0) + 1);
        degree.set(projects[j].id, (degree.get(projects[j].id) ?? 0) + 1);
      }
    }
  }

  const nodes: GraphNode[] = projects.map((p) => {
    const d = degree.get(p.id) ?? 0;
    return {
      id: p.id,
      label: p.name,
      segment: p.segment,
      degree: d,
      val: valueFromDegree(d),
    };
  });

  return { nodes, links };
}
