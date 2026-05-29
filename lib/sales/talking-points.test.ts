import { describe, it, expect } from "vitest";
import { buildTalkingPoints } from "./talking-points";
import type { Project } from "../data/types";

const p = (over: Partial<Project> & { id: string }): Project => ({
  name: over.id,
  developer: "Masterise Homes",
  district: "Quận 2",
  city: "TP.HCM",
  segment: "high-end",
  status: "selling",
  pricePerSqmM: 100,
  ...over,
});

describe("buildTalkingPoints", () => {
  it("grounds every point with a basis", () => {
    const points = buildTalkingPoints({ project: p({ id: "a" }), amenities: ["hồ bơi"] });
    expect(points.length).toBeGreaterThan(0);
    expect(points.every((pt) => pt.basis.length > 0)).toBe(true);
  });

  it("omits points with no supporting fact", () => {
    const bare = p({ id: "b", developer: "", district: "", city: "", pricePerSqmM: 0 });
    const points = buildTalkingPoints({ project: bare });
    // Only the segment point remains (segment always set).
    expect(points.map((x) => x.id)).toEqual(["segment"]);
  });

  it("frames a below-average price as a competitive advantage", () => {
    const points = buildTalkingPoints({
      project: p({ id: "c", pricePerSqmM: 80 }),
      districtAvg: 100,
    });
    const price = points.find((x) => x.id === "price-advantage");
    expect(price).toBeDefined();
    expect(price!.text).toMatch(/lợi thế cạnh tranh/);
  });

  it("flags an above-average price with a prep cue", () => {
    const points = buildTalkingPoints({
      project: p({ id: "d", pricePerSqmM: 130 }),
      districtAvg: 100,
    });
    expect(points.find((x) => x.id === "price-premium")).toBeDefined();
  });

  it("uses a neutral price point when no district average is given", () => {
    const points = buildTalkingPoints({ project: p({ id: "e" }) });
    expect(points.find((x) => x.id === "price")).toBeDefined();
    expect(points.find((x) => x.id === "price-advantage")).toBeUndefined();
  });

  it("lists top amenities", () => {
    const points = buildTalkingPoints({
      project: p({ id: "f" }),
      amenities: ["hồ bơi", "gym", "công viên", "spa", "sân tennis"],
    });
    const am = points.find((x) => x.id === "amenities");
    expect(am).toBeDefined();
    expect(am!.text).toContain("hồ bơi");
    expect(am!.text).toContain("…"); // truncated beyond 4
  });
});
