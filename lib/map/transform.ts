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

function toNode(project: Project): GraphNode {
  return {
    id: project.id,
    label: project.name,
    segment: project.segment,
    // Scale price into a sensible node radius; keep it strictly positive.
    val: Math.max(1, Math.round(project.pricePerSqmM / 20)),
  };
}

// Convert a list of projects into force-graph nodes + links.
// Emits at most one link per unordered pair, labelled with its strongest reason.
export function toGraphData(projects: Project[]): GraphData {
  const nodes = projects.map(toNode);
  const links: GraphLink[] = [];

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const reason = pairReason(projects[i], projects[j]);
      if (reason) {
        links.push({ source: projects[i].id, target: projects[j].id, reason });
      }
    }
  }

  return { nodes, links };
}
