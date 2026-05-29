import { describe, it, expect } from "vitest";
import { buildGuidance } from "./guidance";
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

describe("buildGuidance", () => {
  it("tags the result with the project id and always returns at least one item", () => {
    const target = p({ id: "a" });
    const res = buildGuidance(target, [target]);
    expect(res.projectId).toBe("a");
    expect(res.items.length).toBeGreaterThan(0);
  });

  it("warns when price is well above the district average", () => {
    const target = p({ id: "a", pricePerSqmM: 200 });
    const peers = [target, p({ id: "b", pricePerSqmM: 50 }), p({ id: "c", pricePerSqmM: 50 })];
    const res = buildGuidance(target, peers);
    expect(res.items.some((i) => i.level === "warning" && /district/i.test(i.detail))).toBe(true);
  });

  it("flags planning-stage projects as a warning", () => {
    const target = p({ id: "a", status: "planning" });
    const res = buildGuidance(target, [target]);
    expect(res.items.some((i) => i.level === "warning")).toBe(true);
  });

  it("adds an info item when the project has related projects", () => {
    const target = p({ id: "a", relatedIds: ["b"] });
    const res = buildGuidance(target, [target, p({ id: "b" })]);
    expect(res.items.some((i) => i.level === "info")).toBe(true);
  });
});
