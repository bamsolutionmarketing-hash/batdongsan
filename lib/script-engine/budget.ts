import type { Duration, NodeType, PickedNode } from "./types";

// Word budget totals per duration (Spec 1.3) — used for the R3 warning.
export const WORD_TOTAL: Record<Duration, [number, number]> = {
  15: [45, 55],
  30: [90, 105],
  60: [180, 210],
  90: [270, 300],
  120: [360, 420],
  180: [540, 630],
};

// Planned seconds for a node = rounded midpoint of its [min,max] range.
export const plannedSeconds = (d: [number, number]): number => Math.round((d[0] + d[1]) / 2);

// Never dropped — the contract spine (hook promise + payoff + CTA).
const MANDATORY: ReadonlySet<NodeType> = new Set(["HOOK", "PAYOFF", "CTA"]);

// Drop priority when over budget (R2): LOOP first, then CTX, then trailing BODY.
function nextToDrop(items: PickedNode[]): number {
  const loop = items.findIndex((n) => n.type === "LOOP");
  if (loop >= 0) return loop;
  const ctx = items.findIndex((n) => n.type === "CTX");
  if (ctx >= 0) return ctx;
  for (let i = items.length - 1; i >= 0; i--) {
    if (!MANDATORY.has(items[i].type) && items[i].type !== "PROOF") return i;
  }
  // last resort: drop a PROOF
  const proof = items.findIndex((n) => n.type === "PROOF");
  return proof;
}

export interface BudgetResult {
  items: PickedNode[];
  totalSeconds: number;
  dropped: string[]; // node ids removed to fit
}

// Fit the picked chain into the duration budget (R2). +10% tolerance.
export function fitBudget(items: PickedNode[], durationS: Duration): BudgetResult {
  const cap = durationS * 1.1;
  const kept = [...items];
  const dropped: string[] = [];
  let total = kept.reduce((s, n) => s + plannedSeconds(n.duration), 0);
  while (total > cap) {
    const idx = nextToDrop(kept);
    if (idx < 0) break; // only mandatory left
    dropped.push(kept[idx].id);
    kept.splice(idx, 1);
    total = kept.reduce((s, n) => s + plannedSeconds(n.duration), 0);
  }
  return { items: kept, totalSeconds: total, dropped };
}
