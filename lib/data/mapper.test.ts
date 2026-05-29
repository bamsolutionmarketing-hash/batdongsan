import { describe, it, expect } from "vitest";
import { rowToProject, type ProjectRow } from "./mapper";

const row = (over: Partial<ProjectRow> & { id: string }): ProjectRow => ({
  org_id: "org1",
  slug: "s",
  name: "Dự án",
  developer: "CĐT",
  district: "Q2",
  city: "TP.HCM",
  segment: "luxury",
  status: "selling",
  price_per_sqm_m: 100,
  attributes: null,
  visibility: "org",
  ...over,
});

describe("rowToProject", () => {
  it("maps a full row across to a Project", () => {
    const p = rowToProject(row({ id: "a" }));
    expect(p).toMatchObject({
      id: "a",
      name: "Dự án",
      developer: "CĐT",
      district: "Q2",
      segment: "luxury",
      status: "selling",
      pricePerSqmM: 100,
    });
  });

  it("falls back to safe defaults for null/invalid enums and price", () => {
    const p = rowToProject(row({ id: "b", segment: "weird", status: null, price_per_sqm_m: null }));
    expect(p.segment).toBe("mid-range");
    expect(p.status).toBe("selling");
    expect(p.pricePerSqmM).toBe(0);
  });

  it("reads relatedIds from attributes, defaulting to empty", () => {
    expect(rowToProject(row({ id: "c" })).relatedIds).toEqual([]);
    expect(
      rowToProject(row({ id: "d", attributes: { relatedIds: ["x", "y"] } })).relatedIds,
    ).toEqual(["x", "y"]);
  });

  it("coerces null text fields to empty strings", () => {
    const p = rowToProject(row({ id: "e", developer: null, district: null, city: null }));
    expect(p.developer).toBe("");
    expect(p.district).toBe("");
    expect(p.city).toBe("");
  });
});
