import { describe, it, expect } from "vitest";
import { composeVideoPrompt } from "./videoPrompt";

const base = {
  format: "reel" as const,
  length: 30 as const,
  tone: "than_thien" as const,
  caption: "Bài nháp [TEN_SALE] [SDT]",
  project: { name: "The Global City", locationText: "TP Thủ Đức", phase: null, priceText: null },
  nodes: [
    {
      label: "Kênh nhạc nước",
      facts: [
        { key: "Dài", value: "2 km" },
        { key: "Đồn", value: "bí mật", confidence: "unverified" as const },
      ],
      talkpoint: "tiện ích đã hiện hữu",
      category: "amenity",
    },
  ],
  links: [{ from: "The Global City", label: "có", to: "Kênh nhạc nước" }],
  branding: { displayName: "Nguyễn An", phone: "0900000000", zalo: null },
};

describe("composeVideoPrompt", () => {
  it("includes role, verified data, backbone caption, structure and contact", () => {
    const p = composeVideoPrompt(base);
    expect(p).toContain("biên kịch video");
    expect(p).toContain("① DỮ LIỆU ĐÃ XÁC THỰC");
    expect(p).toContain("Kênh nhạc nước");
    expect(p).toContain("Dài: 2 km");
    expect(p).toContain("Bài nháp"); // backbone caption present
    expect(p).toContain("STORYBOARD");
    expect(p).toContain("Nguyễn An"); // contact at CTA
  });

  it("never leaks unverified facts (compliance spine)", () => {
    const p = composeVideoPrompt(base);
    expect(p).not.toContain("bí mật");
  });

  it("scene plan scales with length", () => {
    const s15 = composeVideoPrompt({ ...base, length: 15 });
    const s60 = composeVideoPrompt({ ...base, length: 60 });
    expect(s15).toContain("~15 giây");
    expect(s60).toContain("~60 giây");
    expect(s15).not.toEqual(s60);
  });

  it("format guide switches per channel", () => {
    expect(composeVideoPrompt({ ...base, format: "tiktok" })).toContain("TikTok");
    expect(composeVideoPrompt({ ...base, format: "short" })).toContain("YouTube Shorts");
  });

  it("keeps the [TEN_SALE]/[SDT] variable legend", () => {
    expect(composeVideoPrompt(base)).toContain("KÝ HIỆU TRONG BÀI");
  });

  it("injects the chosen script template arc", () => {
    const review = composeVideoPrompt({ ...base, template: "review_nha_mau" });
    const sosanh = composeVideoPrompt({ ...base, template: "so_sanh" });
    expect(review).toContain("Tour / review nhà mẫu");
    expect(review).toContain("ban công");
    expect(sosanh).toContain("So sánh 2 lựa chọn");
    expect(review).not.toEqual(sosanh);
  });

  it("falls back to default template for unknown id", () => {
    expect(composeVideoPrompt({ ...base, template: "khong-ton-tai" }))
      .toContain("Tổng quan dự án");
  });
});
