import type { KnowledgeNode } from "@/types/domain";

// Temporary deterministic caption from selected nodes — used until the full
// Assembly Engine (S4). Same input → same output; no AI.
export function buildTempCaption(nodes: Pick<KnowledgeNode, "label" | "facts" | "talkpoint">[]): string {
  const sections = nodes.map((n) => {
    const lines = [`📍 ${n.label}`];
    for (const f of n.facts.slice(0, 3)) lines.push(`• ${f.key}: ${f.value}`);
    if (n.talkpoint) lines.push(n.talkpoint.replace(/^"|"$/g, ""));
    return lines.join("\n");
  });
  return sections.join("\n\n").trim();
}
