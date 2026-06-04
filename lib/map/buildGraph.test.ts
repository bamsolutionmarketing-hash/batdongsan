import { describe, it, expect } from "vitest";
import { buildGraph, edgeKind } from "./buildGraph";
import type { KnowledgeNode, KnowledgeLink } from "@/types/domain";

const node = (id: string, over: Partial<KnowledgeNode> = {}): KnowledgeNode => ({
  id,
  projectId: "p",
  nodeKey: id,
  label: id.toUpperCase(),
  category: "project",
  subLabel: null,
  facts: [],
  talkpoint: null,
  description: null,
  sortOrder: 0,
  ...over,
});

describe("edgeKind", () => {
  it("classifies VN labels into coarse kinds", () => {
    expect(edgeKind("chủ đầu tư")).toBe("supports");
    expect(edgeKind("thuộc")).toBe("part_of");
    expect(edgeKind("gần trạm")).toBe("near");
    expect(edgeKind("abc xyz")).toBe("relates");
    expect(edgeKind(null)).toBe("relates");
  });
});

describe("buildGraph", () => {
  const nodes = [node("a", { category: "project" }), node("b", { category: "infra" })];
  const links: KnowledgeLink[] = [
    { id: "l1", projectId: "p", sourceNode: "a", targetNode: "b", label: "gần" },
  ];

  it("maps category→group and computes degree", () => {
    const { graph } = buildGraph(nodes, links);
    expect(graph.nodes.map((n) => n.group)).toEqual(["project", "infra"]);
    expect(graph.nodes.every((n) => n.degree === 1)).toBe(true);
    expect(graph.links[0]).toMatchObject({ source: "a", target: "b", group: "near" });
  });

  it("drops links with missing endpoints", () => {
    const { graph } = buildGraph(nodes, [
      ...links,
      { id: "l2", projectId: "p", sourceNode: "a", targetNode: "ghost", label: "x" },
    ]);
    expect(graph.links).toHaveLength(1);
  });

  it("composes a multi-part note from facts + description + talkpoint", () => {
    const { notesById } = buildGraph(
      [node("a", { facts: [{ key: "Giá", value: "100" }], description: "Mô tả", talkpoint: "TP" })],
      [],
    );
    expect(notesById["a"].kind).toBe("project");
    expect(notesById["a"].note).toContain("Giá: 100");
    expect(notesById["a"].note).toContain("Mô tả");
    expect(notesById["a"].note).toContain("★ TP");
  });

  it("note is null when node has no detail", () => {
    const { notesById } = buildGraph([node("a")], []);
    expect(notesById["a"].note).toBeNull();
  });
});
