import { describe, it, expect } from "vitest";
import { blockUsable } from "./compliance";
import type { Fact } from "@/types/domain";

const facts: Fact[] = [
  { key: "Giá", value: "100", confidence: "verified" },
  { key: "Tin đồn", value: "x", confidence: "unverified" },
  { key: "Không rõ", value: "y" }, // no confidence → treated as verified
];

describe("blockUsable", () => {
  it("usable when cited facts meet min_confidence", () => {
    const r = blockUsable(
      { role: "body", tone: "neutral", minConfidence: "verified", factKeys: ["Giá"] },
      facts,
    );
    expect(r.usable).toBe(true);
  });

  it("blocks when a cited fact is below min_confidence", () => {
    const r = blockUsable(
      { role: "body", tone: "neutral", minConfidence: "verified", factKeys: ["Tin đồn"] },
      facts,
    );
    expect(r.usable).toBe(false);
    expect(r.reason).toContain("Tin đồn");
  });

  it("blocks when a cited fact is missing", () => {
    const r = blockUsable(
      { role: "hook", tone: "neutral", minConfidence: "verified", factKeys: ["Ghost"] },
      facts,
    );
    expect(r.usable).toBe(false);
    expect(r.reason).toContain("Thiếu fact");
  });

  it("FOMO tone cannot cite an unverified fact even if min allows", () => {
    const r = blockUsable(
      { role: "hook", tone: "fomo", minConfidence: "unverified", factKeys: ["Tin đồn"] },
      facts,
    );
    expect(r.usable).toBe(false);
    expect(r.reason).toContain("FOMO");
  });

  it("facts without explicit confidence count as verified", () => {
    const r = blockUsable(
      { role: "proof", tone: "neutral", minConfidence: "verified", factKeys: ["Không rõ"] },
      facts,
    );
    expect(r.usable).toBe(true);
  });

  it("no cited facts → always usable", () => {
    const r = blockUsable(
      { role: "cta", tone: "neutral", minConfidence: "verified", factKeys: [] },
      facts,
    );
    expect(r.usable).toBe(true);
  });
});
