import { describe, it, expect } from "vitest";
import { generateFacebookPost, generateShortCaption, generateContent } from "./content";
import type { Project } from "../data/types";

const p = (over: Partial<Project> & { id: string }): Project => ({
  name: "Masteri Thảo Điền",
  developer: "Masterise Homes",
  district: "Quận 2",
  city: "TP.HCM",
  segment: "high-end",
  status: "selling",
  pricePerSqmM: 95,
  ...over,
});

describe("generateFacebookPost", () => {
  it("fills slots from facts and records provenance", () => {
    const c = generateFacebookPost({ project: p({ id: "a" }), amenities: ["hồ bơi", "gym"] });
    expect(c.format).toBe("facebook_post");
    expect(c.body).toContain("Masteri Thảo Điền");
    expect(c.body).toContain("95 triệu/m²");
    expect(c.body).toContain("Masterise Homes");
    expect(c.body).toContain("hồ bơi");
    expect(c.usedFacts.length).toBeGreaterThan(0);
    expect(c.missingSlots).toEqual([]);
  });

  it("does not invent lines for missing facts", () => {
    const c = generateFacebookPost({ project: p({ id: "b", developer: "", pricePerSqmM: 0 }) });
    expect(c.body).not.toContain("Giá");
    expect(c.body).not.toContain("Phát triển bởi");
  });

  it("flags required slots that are missing", () => {
    const c = generateFacebookPost({ project: p({ id: "c", name: "", district: "" }) });
    expect(c.missingSlots).toContain("name");
    expect(c.missingSlots).toContain("district");
  });

  it("builds diacritic-free hashtags", () => {
    const c = generateFacebookPost({ project: p({ id: "d" }) });
    expect(c.body).toContain("#MasteriseHomes");
    expect(c.body).toMatch(/#BDSQuan2/);
  });

  it("caps amenities at four", () => {
    const c = generateFacebookPost({
      project: p({ id: "e" }),
      amenities: ["a", "b", "c", "d", "e", "f"],
    });
    const line = c.body.split("\n").find((l) => l.includes("✅"))!;
    expect((line.match(/✅/g) ?? []).length).toBe(4);
  });
});

describe("generateShortCaption", () => {
  it("joins available facts into one line", () => {
    const c = generateShortCaption({ project: p({ id: "f" }) });
    expect(c.body).toContain("Masteri Thảo Điền");
    expect(c.body).toContain("Quận 2");
    expect(c.body).toContain("liên hệ ngay");
  });

  it("returns empty body and flags name when nothing usable", () => {
    const c = generateShortCaption({ project: p({ id: "g", name: "", district: "", pricePerSqmM: 0 }) });
    expect(c.body).toBe("");
    expect(c.missingSlots).toContain("name");
  });
});

describe("generateContent", () => {
  it("dispatches by format", () => {
    expect(generateContent("short_caption", { project: p({ id: "h" }) }).format).toBe("short_caption");
    expect(generateContent("facebook_post", { project: p({ id: "i" }) }).format).toBe("facebook_post");
  });
});
