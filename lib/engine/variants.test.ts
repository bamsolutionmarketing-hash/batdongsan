import { describe, it, expect } from "vitest";
import { fnv1a, pickIndex, isoWeek } from "./variants";

describe("variants", () => {
  it("fnv1a is deterministic + unsigned 32-bit", () => {
    expect(fnv1a("abc")).toBe(fnv1a("abc"));
    expect(fnv1a("abc")).not.toBe(fnv1a("abd"));
    expect(fnv1a("x") >>> 0).toBe(fnv1a("x"));
  });
  it("pickIndex stays in range and is stable", () => {
    expect(pickIndex("seed", 0)).toBe(-1);
    for (const c of [1, 2, 5]) {
      const i = pickIndex("seed", c);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(c);
    }
    expect(pickIndex("seed", 5)).toBe(pickIndex("seed", 5));
  });
  it("isoWeek format", () => {
    expect(isoWeek(new Date("2026-06-05"))).toMatch(/^\d{4}-W\d{1,2}$/);
  });
});
