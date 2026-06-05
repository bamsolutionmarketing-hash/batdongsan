import { describe, it, expect } from "vitest";
import { assembleCaption, type NodeWithBlocks } from "./assembly";
import type { ContentBlock } from "@/types/domain";

const blk = (o: Partial<ContentBlock> & { id: string; role: ContentBlock["role"] }): ContentBlock => ({
  nodeId: "n", variantNo: 1, text: o.id, tone: "neutral", minConfidence: "verified",
  factKeys: [], isEnabled: true, ...o,
});

const nodes: NodeWithBlocks[] = [
  { id: "a", label: "A", category: "project", facts: [{ key: "k", value: "v" }],
    blocks: [blk({ id: "hookA", role: "hook", text: "Hook [TEN_SALE]" }), blk({ id: "bodyA", role: "body", text: "Body A" })] },
  { id: "b", label: "B", category: "infra", facts: [],
    blocks: [blk({ id: "bodyB", role: "body", text: "Body B" })] },
];
const cta = [blk({ id: "cta1", role: "cta", text: "CTA [SDT]" })];
const ctx = { branding: { displayName: "An", phone: "0900" } };

describe("assembleCaption", () => {
  it("fills slots, substitutes vars, deterministic", () => {
    const r = assembleCaption({ structure: ["hook", "body", "cta"], nodes, ctaBlocks: cta, ctx, seed: "s" });
    expect(r.caption).toContain("Hook An");
    expect(r.caption).toContain("CTA 0900");
    expect(r.usedBlockIds).toContain("hookA");
    const r2 = assembleCaption({ structure: ["hook", "body", "cta"], nodes, ctaBlocks: cta, ctx, seed: "s" });
    expect(r2.caption).toBe(r.caption);
  });
  it("skips block with missing required var", () => {
    const r = assembleCaption({ structure: ["cta"], nodes, ctaBlocks: cta, ctx: { branding: {} }, seed: "s" });
    expect(r.caption).toBe("");
    expect(r.missingVars).toContain("SDT");
  });
  it("skips compliance-blocked blocks", () => {
    const bad: NodeWithBlocks[] = [{ id: "a", label: "A", category: "x", facts: [],
      blocks: [blk({ id: "h", role: "hook", text: "x", factKeys: ["ghost"] })] }];
    const r = assembleCaption({ structure: ["hook"], nodes: bad, ctaBlocks: [], ctx, seed: "s" });
    expect(r.caption).toBe("");
  });
});
