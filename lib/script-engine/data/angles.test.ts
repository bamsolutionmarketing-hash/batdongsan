import { describe, it, expect } from "vitest";
import { cohesion, getAngle } from "./angles";

describe("cohesion (đồng nhất)", () => {
  it("scores a single-cluster node set high", () => {
    const r = cohesion("vi_tri", [
      { label: "Mặt tiền QL13", category: "road" },
      { label: "Ga metro số 1", category: "metro" },
    ]);
    expect(r.score).toBe(100);
    expect(r.offTopic).toHaveLength(0);
  });

  it("flags off-topic nodes + suggests the dominant angle", () => {
    const r = cohesion("vi_tri", [
      { label: "Ga metro", category: "metro" },
      { label: "Giá 2.1 tỷ", category: "finance" },
      { label: "Sổ hồng riêng", category: "legal" },
    ]);
    expect(r.score).toBeLessThan(70);
    expect(r.offTopic).toContain("Giá 2.1 tỷ");
    expect(r.offTopic).toContain("Sổ hồng riêng");
  });

  it("no angle → neutral, still suggests an angle from the nodes", () => {
    const r = cohesion(null, [{ label: "Giá tốt", category: "finance" }]);
    expect(r.suggestedAngleId).toBe("dau_tu");
  });

  it("getAngle resolves presets", () => {
    expect(getAngle("phap_ly")?.short).toBe("Pháp lý");
    expect(getAngle("nope")).toBeUndefined();
  });
});
