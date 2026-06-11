import { describe, it, expect } from "vitest";
import { composePrompt, composeScriptPrompt } from "./promptComposer";
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
  it("12 mode×tone combos each produce all 7 blocks + rules + quality bar + role header + contract", () => {
    for (const mode of MODES)
      for (const tone of TONES) {
        const p = composePrompt({ ...base, mode, tone });
        for (const m of ["①", "②", "③", "④", "⑤", "⑥", "⑦"]) expect(p).toContain(m);
        expect(p).toContain("QUY TẮC BẮT BUỘC");
        expect(p).toContain("TIÊU CHUẨN BÀI MƯỢT"); // v2 quality gate
        expect(p).toContain("NGUYÊN LIỆU BÀI"); // draft framed as raw material, not skeleton
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

describe("composeScriptPrompt (video → AI prompt)", () => {
  const script = [
    { start: 0, end: 3, visual: "Flycam dự án", speech: "Mở bài hook", overlay: "GLADIA" },
    { start: 3, end: 10, visual: "Cảnh hồ bơi", speech: "Hồ bơi tràn bờ tầng cao", overlay: "Hồ bơi vô cực" },
  ];

  it("wraps the whole script with platform, scenes, caption, checklist and rules", () => {
    const p = composeScriptPrompt({
      platform: "tiktok",
      durationS: 30,
      contentTypeName: "Tour dự án",
      projectName: "Gladia",
      script,
      caption: { text: "Caption mẫu", hashtags: ["#bds", "#gladia"] },
      checklist: ["Quay flycam", "Quay hồ bơi"],
    });
    expect(p).toContain("TikTok");
    expect(p).toContain("Gladia");
    expect(p).toContain("Hồ bơi tràn bờ tầng cao"); // scene speech
    expect(p).toContain("Hồ bơi vô cực"); // overlay
    expect(p).toContain("Caption mẫu");
    expect(p).toContain("#bds");
    expect(p).toContain("Quay flycam"); // checklist
    expect(p).toContain("KHÔNG hứa lợi nhuận"); // compliance spine
    expect(p.length).toBeGreaterThan(100);
  });

  it("works with minimal input (no caption/checklist)", () => {
    const p = composeScriptPrompt({ platform: "reels", durationS: 15, script });
    expect(p).toContain("Reels");
    expect(p).toContain("Mở bài hook");
    expect(p).not.toContain("CAPTION & HASHTAG");
  });
});
