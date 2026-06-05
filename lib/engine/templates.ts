import { pickIndex } from "./variants";

export interface AssemblyTemplate {
  id: string;
  angleMatch: string[]; // categories that activate this template
  structure: string[]; // ordered slot roles e.g. ["hook","body","proof","cta"]
  weight: number;
}

// Dominant categories of the selected nodes (most frequent first).
export function detectAngle(categories: string[]): string[] {
  const count = new Map<string, number>();
  for (const c of categories) count.set(c, (count.get(c) ?? 0) + 1);
  return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
}

// Pick a template whose angle_match intersects the node categories. Weighted
// deterministic rotation by seed. Falls back to any enabled template.
export function pickTemplate(
  templates: AssemblyTemplate[],
  categories: string[],
  seed: string,
): AssemblyTemplate | null {
  const cats = new Set(categories);
  const matched = templates.filter((t) => t.angleMatch.some((a) => cats.has(a)));
  const pool = matched.length > 0 ? matched : templates;
  if (pool.length === 0) return null;

  // Expand by weight so higher-weight templates appear proportionally.
  const expanded: AssemblyTemplate[] = [];
  for (const t of pool) for (let i = 0; i < Math.max(1, t.weight); i++) expanded.push(t);
  return expanded[pickIndex(`${seed}:template`, expanded.length)];
}
