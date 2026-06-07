import { describe, it, expect } from "vitest";
import { HOOK_BANK } from "./hooks";
import { NODE_BANK } from "./nodes";
import { SLOT_REGISTRY, contentFallback } from "./slots";

// Guards the "node prompt bị lỗi" regression: any {{slot}} that is NOT gated by
// requiresSlots must render to natural text when unfilled — i.e. it has a
// registry fallback, a content fallback, or is an engine-provided FORMAT slot.
// Otherwise the renderer leaks a machine-y key like "ket qua" / "vi sao quan trong".

const TOKEN = /\{\{(\w+)\}\}/g;
const ALWAYS = new Set(["nam", "thang", "ngay", "n", "so_luong", "thoi_luong", "tu_khoa_seo"]);
const tokens = (s?: string): string[] => {
  const out = new Set<string>();
  for (const m of (s ?? "").matchAll(TOKEN)) out.add(m[1]);
  return [...out];
};
const rendersCleanly = (t: string): boolean =>
  ALWAYS.has(t) || !!SLOT_REGISTRY[t]?.fallbackText || !!contentFallback(t);

describe("node/hook templates render without leaking raw tokens", () => {
  const offenders: string[] = [];
  for (const n of NODE_BANK) {
    const required = new Set(n.requiresSlots ?? []);
    for (const field of ["text", "onscreen"] as const) {
      for (const t of tokens((n as Record<string, unknown>)[field] as string | undefined)) {
        if (!required.has(t) && !rendersCleanly(t)) offenders.push(`NODE ${n.id}.${field} {{${t}}}`);
      }
    }
  }
  for (const h of HOOK_BANK) {
    const required = new Set(h.requiresSlots ?? []);
    for (const field of ["text", "onscreen"] as const) {
      for (const t of tokens((h as Record<string, unknown>)[field] as string | undefined)) {
        if (!required.has(t) && !rendersCleanly(t)) offenders.push(`HOOK ${h.id}.${field} {{${t}}}`);
      }
    }
  }

  it("has no ungated slot without a smooth fallback", () => {
    expect(offenders, offenders.join("\n")).toHaveLength(0);
  });

  it("every hook has a non-empty onscreen + visual (P7)", () => {
    const bad = HOOK_BANK.filter((h) => !h.onscreen || !h.visual).map((h) => h.id);
    expect(bad, bad.join(", ")).toHaveLength(0);
  });
});
