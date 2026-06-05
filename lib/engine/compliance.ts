import type { BlockRole, BlockTone, Confidence, Fact } from "@/types/domain";

// confidence ordering: verified (strongest) > sales_claim > unverified
const RANK: Record<Confidence, number> = { verified: 2, sales_claim: 1, unverified: 0 };

// A fact's confidence; facts without an explicit level are treated as verified.
const factConfidence = (f: Fact): Confidence => f.confidence ?? "verified";

export interface ComplianceInput {
  role: BlockRole;
  tone: BlockTone;
  minConfidence: Confidence;
  factKeys: string[];
}
export interface ComplianceResult {
  usable: boolean;
  reason: string | null;
}

// A block is usable only if every fact it cites meets its min_confidence, and a
// FOMO-toned block never cites an unverified fact (hard rule).
export function blockUsable(block: ComplianceInput, nodeFacts: Fact[]): ComplianceResult {
  const byKey = new Map(nodeFacts.map((f) => [f.key, f]));
  for (const key of block.factKeys) {
    const fact = byKey.get(key);
    if (!fact) return { usable: false, reason: `Thiếu fact: "${key}"` };
    const conf = factConfidence(fact);
    if (RANK[conf] < RANK[block.minConfidence]) {
      return { usable: false, reason: `Fact "${key}" (${conf}) < yêu cầu ${block.minConfidence}` };
    }
    if (block.tone === "fomo" && conf === "unverified") {
      return { usable: false, reason: `Tone FOMO không được dùng fact unverified ("${key}")` };
    }
  }
  return { usable: true, reason: null };
}
