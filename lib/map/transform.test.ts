import { describe, it, expect } from "vitest";
import { toGraphData, pairReason } from "./transform";
import type { Project } from "../data/types";

const p = (over: Partial<Project> & { id: string }): Project => ({
  name: over.id,
  developer: "Dev",
  district: "D1",
  city: "TP.HCM",
  segment: "mid-range",
  status: "selling",
  pricePerSqmM: 50,
  ...over,
});

describe("pairReason", () => {
  it("prioritises explicit relation over everything", () => {
    const a = p({ id: "a", relatedIds: ["b"], developer: "X" });
    const b = p({ id: "b", developer: "Y", district: "D9" });
    expect(pairReason(a, b)).toBe("related");
  });

  it("falls back to same-developer, then district, then segment", () => {
    expect(
      pairReason(p({ id: "a", developer: "X" }), p({ id: "b", developer: "X", district: "D9" })),
    ).toBe("same-developer");
    expect(
      pairReason(
        p({ id: "a", developer: "X", district: "D1" }),
        p({ id: "b", developer: "Y", district: "D1", segment: "luxury" }),
      ),
    ).toBe("same-district");
    expect(
      pairReason(
        p({ id: "a", developer: "X", district: "D1", segment: "luxury" }),
        p({ id: "b", developer: "Y", district: "D9", segment: "luxury" }),
      ),
    ).toBe("same-segment");
  });

  it("returns null when projects share nothing", () => {
    const a = p({ id: "a", developer: "X", district: "D1", segment: "luxury" });
    const b = p({ id: "b", developer: "Y", district: "D9", segment: "affordable" });
    expect(pairReason(a, b)).toBeNull();
  });
});

describe("toGraphData", () => {
  it("maps every project to a node with a positive val", () => {
    const data = toGraphData([p({ id: "a" }), p({ id: "b", developer: "Z", district: "D9", segment: "luxury" })]);
    expect(data.nodes).toHaveLength(2);
    expect(data.nodes.every((n) => n.val > 0)).toBe(true);
  });

  it("creates exactly one link per related pair", () => {
    const data = toGraphData([
      p({ id: "a", developer: "X" }),
      p({ id: "b", developer: "X" }),
    ]);
    expect(data.links).toHaveLength(1);
    expect(data.links[0]).toMatchObject({ source: "a", target: "b", reason: "same-developer" });
  });

  it("does not link unrelated projects", () => {
    const data = toGraphData([
      p({ id: "a", developer: "X", district: "D1", segment: "luxury" }),
      p({ id: "b", developer: "Y", district: "D9", segment: "affordable" }),
    ]);
    expect(data.links).toHaveLength(0);
  });

  it("sizes nodes by degree (Obsidian-style)", () => {
    // a relates to b, c, d; the leaves share nothing with each other ->
    // a is a hub (degree 3), each leaf degree 1.
    const data = toGraphData([
      p({ id: "a", relatedIds: ["b", "c", "d"], developer: "DA", district: "D1", segment: "luxury" }),
      p({ id: "b", developer: "DB", district: "D2", segment: "high-end" }),
      p({ id: "c", developer: "DC", district: "D3", segment: "mid-range" }),
      p({ id: "d", developer: "DD", district: "D4", segment: "affordable" }),
    ]);
    const byId = Object.fromEntries(data.nodes.map((n) => [n.id, n]));
    expect(byId.a.degree).toBe(3);
    expect(byId.b.degree).toBe(1);
    // the hub is strictly larger than a leaf
    expect(byId.a.val).toBeGreaterThan(byId.b.val);
  });

  it("gives isolated nodes a positive minimum size", () => {
    const data = toGraphData([
      p({ id: "a", developer: "X", district: "D1", segment: "luxury" }),
      p({ id: "b", developer: "Y", district: "D9", segment: "affordable" }),
    ]);
    expect(data.nodes.every((n) => n.degree === 0 && n.val >= 1)).toBe(true);
  });
});
