import { describe, it, expect } from "vitest";
import { buildProjectGraph, type MapNodeRow, type MapEdgeRow } from "./project-graph";

const nodes: MapNodeRow[] = [
  { id: "n1", label: "Hồ bơi", kind: "amenity", note: null },
  { id: "n2", label: "View sông", kind: "selling_point", note: null },
  { id: "n3", label: "Quận 2", kind: "location", note: null },
];

describe("buildProjectGraph", () => {
  it("maps nodes with kind as group", () => {
    const g = buildProjectGraph(nodes, []);
    expect(g.nodes.map((n) => n.group)).toEqual(["amenity", "selling_point", "location"]);
    expect(g.nodes.every((n) => n.val >= 1)).toBe(true);
  });

  it("creates links and computes degree", () => {
    const edges: MapEdgeRow[] = [
      { id: "e1", source_id: "n1", target_id: "n2", kind: "supports" },
      { id: "e2", source_id: "n2", target_id: "n3", kind: "near" },
    ];
    const g = buildProjectGraph(nodes, edges);
    expect(g.links).toHaveLength(2);
    const byId = Object.fromEntries(g.nodes.map((n) => [n.id, n]));
    expect(byId.n2.degree).toBe(2); // hub
    expect(byId.n1.degree).toBe(1);
    expect(byId.n2.val).toBeGreaterThanOrEqual(byId.n1.val);
  });

  it("drops edges whose endpoints are missing", () => {
    const edges: MapEdgeRow[] = [
      { id: "e1", source_id: "n1", target_id: "ghost", kind: "relates" },
    ];
    const g = buildProjectGraph(nodes, edges);
    expect(g.links).toHaveLength(0);
  });

  it("preserves edge kind as link group", () => {
    const g = buildProjectGraph(nodes, [
      { id: "e1", source_id: "n1", target_id: "n2", kind: "part_of" },
    ]);
    expect(g.links[0].group).toBe("part_of");
  });
});
