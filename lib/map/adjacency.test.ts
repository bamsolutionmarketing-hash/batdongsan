import { describe, it, expect } from "vitest";
import { buildAdjacency, neighborhood, pairKey } from "./adjacency";
import type { GraphData } from "../data/types";

const data: GraphData = {
  nodes: [
    { id: "a", label: "A", group: "luxury", degree: 0, val: 1 },
    { id: "b", label: "B", group: "luxury", degree: 0, val: 1 },
    { id: "c", label: "C", group: "mid-range", degree: 0, val: 1 },
    { id: "d", label: "D", group: "affordable", degree: 0, val: 1 },
  ],
  links: [
    { source: "a", target: "b", group: "same-developer" },
    { source: "b", target: "c", group: "same-district" },
  ],
};

describe("pairKey", () => {
  it("is order-independent", () => {
    expect(pairKey("a", "b")).toBe(pairKey("b", "a"));
  });
});

describe("buildAdjacency", () => {
  it("records mutual neighbors and link keys", () => {
    const adj = buildAdjacency(data);
    expect(adj.neighbors.get("b")).toEqual(new Set(["a", "c"]));
    expect(adj.neighbors.get("a")).toEqual(new Set(["b"]));
    expect(adj.neighbors.get("d")).toEqual(new Set());
    expect(adj.linkKeys.has(pairKey("a", "b"))).toBe(true);
    expect(adj.linkKeys.has(pairKey("a", "c"))).toBe(false);
  });

  it("handles object-shaped link ends (post force-layout mutation)", () => {
    const mutated: GraphData = {
      nodes: data.nodes,
      links: [{ source: { id: "a" }, target: { id: "b" }, group: "related" } as never],
    };
    const adj = buildAdjacency(mutated);
    expect(adj.neighbors.get("a")).toEqual(new Set(["b"]));
  });
});

describe("neighborhood", () => {
  it("returns the node plus its direct neighbors", () => {
    const adj = buildAdjacency(data);
    expect(neighborhood(adj, "b")).toEqual(new Set(["b", "a", "c"]));
  });

  it("is empty for null focus", () => {
    const adj = buildAdjacency(data);
    expect(neighborhood(adj, null).size).toBe(0);
  });
});
