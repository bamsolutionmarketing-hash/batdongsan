import { describe, it, expect } from "vitest";
import { normalizeText, matchesFacets, searchMatches, collectFacets, applyFilters } from "./filter";
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

describe("normalizeText", () => {
  it("strips Vietnamese diacritics and lowercases", () => {
    expect(normalizeText("Thảo Điền")).toBe("thao dien");
    expect(normalizeText("GLADIA")).toBe("gladia");
  });
});

describe("matchesFacets", () => {
  const proj = p({ id: "a", segment: "luxury", district: "Q2", developer: "X", status: "selling" });

  it("passes when all facet lists are empty", () => {
    expect(matchesFacets(proj, {})).toBe(true);
  });

  it("requires AND across categories, OR within a category", () => {
    expect(matchesFacets(proj, { segments: ["luxury", "high-end"] })).toBe(true);
    expect(matchesFacets(proj, { segments: ["mid-range"] })).toBe(false);
    expect(matchesFacets(proj, { segments: ["luxury"], districts: ["Q9"] })).toBe(false);
    expect(matchesFacets(proj, { segments: ["luxury"], districts: ["Q2"] })).toBe(true);
  });
});

describe("searchMatches", () => {
  const proj = p({ id: "a", name: "Masteri Thảo Điền" });

  it("is true for empty query", () => {
    expect(searchMatches(proj, "")).toBe(true);
    expect(searchMatches(proj, "   ")).toBe(true);
  });

  it("matches accent-insensitively on name", () => {
    expect(searchMatches(proj, "thao dien")).toBe(true);
    expect(searchMatches(proj, "MASTERI")).toBe(true);
    expect(searchMatches(proj, "gladia")).toBe(false);
  });
});

describe("collectFacets", () => {
  it("returns sorted distinct values per category", () => {
    const facets = collectFacets([
      p({ id: "a", segment: "luxury", district: "Q2", developer: "X" }),
      p({ id: "b", segment: "luxury", district: "Q9", developer: "Y" }),
    ]);
    expect(facets.segments).toEqual(["luxury"]);
    expect(facets.districts).toEqual(["Q2", "Q9"]);
    expect(facets.developers).toEqual(["X", "Y"]);
  });
});

describe("applyFilters", () => {
  const projects = [
    p({ id: "a", name: "Masteri Thảo Điền", segment: "luxury" }),
    p({ id: "b", name: "Gladia", segment: "luxury" }),
    p({ id: "c", name: "Vinhomes", segment: "mid-range" }),
  ];

  it("narrows visible set by facets", () => {
    const { visible, highlightIds } = applyFilters(projects, { segments: ["luxury"] });
    expect(visible.map((x) => x.id)).toEqual(["a", "b"]);
    expect(highlightIds).toEqual([]);
  });

  it("highlights query matches within the visible set only", () => {
    const { visible, highlightIds } = applyFilters(projects, { segments: ["luxury"], query: "gladia" });
    expect(visible.map((x) => x.id)).toEqual(["a", "b"]);
    expect(highlightIds).toEqual(["b"]);
  });

  it("does not highlight matches that were filtered out", () => {
    const { highlightIds } = applyFilters(projects, { segments: ["mid-range"], query: "gladia" });
    expect(highlightIds).toEqual([]);
  });
});
