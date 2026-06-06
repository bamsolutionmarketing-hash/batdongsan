import type { CompatLevel, CompatMatrix, HookFamily } from "../types";

// COMPATIBILITY MATRIX (Spec §2.5) — Hook family × Content type.
// ● preferred  ○ allowed  ✕ blocked. Columns are CT-01 … CT-12 in order.
// Encoded as 12-symbol rows so the table maps 1:1 to the spec for auditing.

const RECIPE_IDS = [
  "CT-01", "CT-02", "CT-03", "CT-04", "CT-05", "CT-06",
  "CT-07", "CT-08", "CT-09", "CT-10", "CT-11", "CT-12",
];

const ROWS: Record<HookFamily, string> = {
  FAQ:  "○○✕●○○✕○✕○✕●",
  CMP:  "○○✕○○●✕○✕○✕○",
  DAT:  "○○✕○●○✕○✕○●○",
  EMO:  "○✕○○✕✕●●○✕✕○",
  RVL:  "●○●✕✕○○○○✕○✕",
  POV:  "○✕●✕✕✕○✕●✕○✕",
  TRD:  "○○○✕○✕✕✕○○○✕",
  LUX:  "○○○✕✕✕✕✕●○✕✕",
  PRC:  "●●○○○○✕○○○○○",
  TIP:  "✕○✕○✕✕✕○✕●✕○",
  LST:  "○○○○○✕✕○○●✕✕",
  QUE:  "●●○○○○○○○○○●",
  DIR:  "○○○○✕✕○○○○○○",
  MYT:  "✕○✕●○○○●✕○✕○",
  FOMO: "○✕○✕○✕✕✕✕✕●✕",
  MIR:  "○○●○○○●○○✕○○",
};

const SYMBOL: Record<string, CompatLevel> = {
  "●": "preferred",
  "○": "allowed",
  "✕": "blocked",
};

function buildMatrix(): CompatMatrix {
  const out = {} as CompatMatrix;
  for (const family of Object.keys(ROWS) as HookFamily[]) {
    const row = [...ROWS[family]];
    const cell: Partial<Record<string, CompatLevel>> = {};
    RECIPE_IDS.forEach((rid, i) => {
      cell[rid] = SYMBOL[row[i]] ?? "blocked";
    });
    out[family] = cell;
  }
  return out;
}

export const COMPAT: CompatMatrix = buildMatrix();

export function compatLevel(family: HookFamily, recipeId: string): CompatLevel {
  return COMPAT[family]?.[recipeId] ?? "blocked";
}
