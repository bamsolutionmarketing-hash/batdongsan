import { describe, it, expect } from "vitest";
import { assembleCaption, buildEditableCaption, buildAddableGroups, type NodeWithBlocks } from "./assembly";
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

describe("buildEditableCaption", () => {
  const multi: NodeWithBlocks[] = [
    { id: "a", label: "A", category: "project", facts: [{ key: "k", value: "v" }], blocks: [
      blk({ id: "h1", role: "hook", text: "Hook one [TEN_SALE]" }),
      blk({ id: "h2", role: "hook", text: "Hook two" }),
      blk({ id: "b1", role: "body", text: "Body" }),
    ] },
  ];

  it("returns every usable+substituted option per slot, with a seeded default", () => {
    const { slots } = buildEditableCaption({ structure: ["hook", "cta"], nodes: multi, ctaBlocks: cta, ctx, seed: "s" });
    const hook = slots.find((s) => s.role === "hook")!;
    expect(hook.options).toHaveLength(2);
    expect(hook.options.map((o) => o.text)).toContain("Hook one An"); // substituted
    expect(hook.selectedIndex).toBeGreaterThanOrEqual(0);
    expect(hook.selectedIndex).toBeLessThan(2);
    // cta slot present and substituted from the global pool
    expect(slots.find((s) => s.role === "cta")?.options[0].text).toBe("CTA 0900");
  });

  it("omits options that can't fully substitute required vars", () => {
    const { slots } = buildEditableCaption({ structure: ["hook"], nodes: multi, ctaBlocks: [], ctx: { branding: {} }, seed: "s" });
    const hook = slots.find((s) => s.role === "hook")!;
    // "Hook one [TEN_SALE]" drops (missing TEN_SALE), only "Hook two" remains
    expect(hook.options.map((o) => o.text)).toEqual(["Hook two"]);
  });

  it("drops a slot entirely when no option is usable", () => {
    const { slots } = buildEditableCaption({ structure: ["proof"], nodes: multi, ctaBlocks: [], ctx, seed: "s" });
    expect(slots).toHaveLength(0);
  });
});

describe("buildAddableGroups", () => {
  it("lists one group per (node × role) that has options, plus the CTA pool", () => {
    const groups = buildAddableGroups({ nodes, ctaBlocks: cta, ctx });
    // node A: hook + body; node B: body; + cta pool = 4 groups
    expect(groups.map((g) => g.key).sort()).toEqual(["a:body", "a:hook", "b:body", "cta:pool"]);
    const ctaGroup = groups.find((g) => g.role === "cta")!;
    expect(ctaGroup.options[0].text).toBe("CTA 0900");
  });
});
