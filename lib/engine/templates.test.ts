import { describe, it, expect } from "vitest";
import { detectAngle, pickTemplate, type AssemblyTemplate } from "./templates";

const T: AssemblyTemplate[] = [
  { id: "infra", angleMatch: ["infra", "finance"], structure: ["hook", "body", "cta"], weight: 1 },
  { id: "brand", angleMatch: ["brand", "group"], structure: ["hook", "proof", "cta"], weight: 1 },
];

describe("templates", () => {
  it("detectAngle orders by frequency", () => {
    expect(detectAngle(["infra", "infra", "finance"])[0]).toBe("infra");
  });
  it("pickTemplate matches by category intersection, deterministic", () => {
    const t = pickTemplate(T, ["infra"], "s");
    expect(t?.id).toBe("infra");
    expect(pickTemplate(T, ["infra"], "s")?.id).toBe("infra");
  });
  it("falls back to any template when no match", () => {
    expect(pickTemplate(T, ["policy"], "s")).not.toBeNull();
  });
  it("returns null on empty pool", () => {
    expect(pickTemplate([], ["x"], "s")).toBeNull();
  });
});
