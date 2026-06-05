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
  it("12 mode×tone combos each produce all 6 blocks + rules + role header + contract", () => {
    for (const mode of MODES)
      for (const tone of TONES) {
        const p = composePrompt({ ...base, mode, tone });
        for (const m of ["①", "②", "③", "④", "⑤", "⑥"]) expect(p).toContain(m);
        expect(p).toContain("QUY TẮC BẮT BUỘC");
        expect(p).toContain("chuyên gia copywriting"); // role header
        expect(p).toContain("CHỈ in ra nội dung bài đăng"); // output contract
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

  it("includes node angle (talkpoint) and relationships", () => {
    const p = composePrompt({
      ...base,
      mode: "fb_post",
      tone: "ke_chuyen",
      nodes: [
        { label: "A", facts: base.nodes[0].facts, talkpoint: '"câu chuyện vị trí"' },
        { label: "B", facts: [{ key: "Năm", value: "1991", confidence: "verified" as const }] },
      ],
      links: [{ from: "A", label: "chủ đầu tư", to: "B" }],
    });
    expect(p).toContain("góc kể: câu chuyện vị trí"); // quotes stripped
    expect(p).toContain("QUAN HỆ GIỮA CÁC ĐIỂM");
    expect(p).toContain("A —(chủ đầu tư)→ B");
  });

  it("builds a variable legend only for tokens present in the caption", () => {
    const withTokens = composePrompt({
      ...base,
      mode: "zalo_message",
      tone: "than_thien",
      caption: "Liên hệ [TEN_SALE] – [SDT] về [TEN_DU_AN]",
    });
    expect(withTokens).toContain("KÝ HIỆU TRONG BÀI");
    expect(withTokens).toContain("[TEN_SALE] = An");
    expect(withTokens).toContain("[TEN_DU_AN] = Gladia");

    const noTokens = composePrompt({ ...base, mode: "fb_post", tone: "chuyen_gia" });
    expect(noTokens).not.toContain("KÝ HIỆU TRONG BÀI");
  });

  it("keeps unknown placeholder tokens verbatim", () => {
    const p = composePrompt({
      ...base,
      mode: "fb_post",
      tone: "chuyen_gia",
      caption: "Ưu đãi [MA_KM] hôm nay",
    });
    expect(p).toContain("[MA_KM] = (giữ nguyên ký hiệu)");
  });
});
