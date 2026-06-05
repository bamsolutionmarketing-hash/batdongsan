import { describe, it, expect } from "vitest";
import { composePrompt } from "./promptComposer";
import type { ComposeMode, ComposeTone } from "@/types/domain";

const MODES: ComposeMode[] = ["fb_post", "fb_analysis", "short_caption", "zalo_message"];
const TONES: ComposeTone[] = ["chuyen_gia", "than_thien", "ke_chuyen"];

const base = {
  caption: "Bài gốc",
  project: { name: "Gladia", locationText: "TĐ" },
  nodes: [{ label: "A", facts: [
    { key: "Giá", value: "100", confidence: "verified" as const },
    { key: "Đồn", value: "x", confidence: "unverified" as const },
  ] }],
  branding: { displayName: "An", phone: "0900" },
};

describe("composePrompt", () => {
  it("12 mode×tone combos each produce all 6 blocks + rules", () => {
    for (const mode of MODES)
      for (const tone of TONES) {
        const p = composePrompt({ ...base, mode, tone });
        for (const m of ["①", "②", "③", "④", "⑤", "⑥"]) expect(p).toContain(m);
        expect(p).toContain("QUY TẮC BẮT BUỘC");
        expect(p).toContain("Bài gốc");
      }
  });
  it("only verified facts enter block ①", () => {
    const p = composePrompt({ ...base, mode: "fb_post", tone: "chuyen_gia" });
    expect(p).toContain("Giá: 100");
    expect(p).not.toContain("Đồn: x");
  });
  it("keeps contact line", () => {
    const p = composePrompt({ ...base, mode: "zalo_message", tone: "than_thien" });
    expect(p).toContain("An — 0900");
  });
});
