import { describe, it, expect } from "vitest";
import { scoreLead } from "./lead";
import { inferDiscovery, QUESTIONS } from "./discovery";

const opt = (qid: string, needle: string) => {
  const q = QUESTIONS.find((x) => x.id === qid)!;
  const i = q.options.findIndex((o) => o.label.includes(needle));
  if (i < 0) throw new Error(`no option ${needle} in ${qid}`);
  return i;
};

describe("scoreLead — tiers", () => {
  it("a high earner, ready to buy, owner-occupier scores HOT", () => {
    const d = inferDiscovery({
      nganh_nghe: opt("nganh_nghe", "Giám đốc"),
      xe: opt("xe", "Ô tô sang"),
      muc_dich: opt("muc_dich", "Mua để ở"),
      do_gap: opt("do_gap", "Cần sớm"),
      giai_doan: opt("giai_doan", "chọn căn"),
      ho_gia_dinh: opt("ho_gia_dinh", "2 con"),
      no_hien_co: opt("no_hien_co", "Không"),
    });
    const r = scoreLead({ discovery: d });
    expect(r.tier).toBe("nong");
    expect(r.score).toBeGreaterThanOrEqual(70);
    expect(r.reliable).toBe(true);
    expect(r.strengths.length).toBeGreaterThan(0);
    expect(r.nextActions[0]).toMatch(/Ưu tiên cao/);
  });

  it("a not-urgent, just-browsing, cash-thin lead scores COLD/WARM with nurture action", () => {
    const d = inferDiscovery({
      nganh_nghe: opt("nganh_nghe", "Nhân viên"),
      do_gap: opt("do_gap", "Thong thả"),
      giai_doan: opt("giai_doan", "Mới bắt đầu"),
      tich_luy: opt("tich_luy", "Chưa tích luỹ"),
    });
    const r = scoreLead({ discovery: d });
    expect(["nguoi", "am"]).toContain(r.tier);
    expect(r.score).toBeLessThan(70);
    expect(r.nextActions.join(" ")).toMatch(/nuôi dưỡng|chăm dài hạn|nguội/i);
  });
});

describe("scoreLead — affordability override + actions", () => {
  it("affordability verdict drives the finance dimension", () => {
    const d = inferDiscovery({ nganh_nghe: opt("nganh_nghe", "Nhân viên") });
    const du = scoreLead({ discovery: d, affordability: { verdict: "khoe" } });
    const chua = scoreLead({ discovery: d, affordability: { verdict: "chua_du" } });
    const fin = (x: typeof du) => x.dimensions.find((y) => y.key === "tai_chinh")!.score;
    expect(fin(du)).toBeGreaterThan(fin(chua));
    expect(chua.nextActions.join(" ")).toMatch(/vừa tầm|đồng vay|kỳ hạn/);
  });

  it("family decision-maker triggers the 'bring the decider' action", () => {
    const d = inferDiscovery({ nguon_tien: opt("nguon_tien", "Người nhà") });
    const r = scoreLead({ discovery: d });
    expect(r.nextActions.join(" ")).toMatch(/người quyết|vợ\/chồng|người nhà/i);
  });

  it("empty discovery → low score, flagged unreliable, asks for more", () => {
    const d = inferDiscovery({});
    const r = scoreLead({ discovery: d });
    expect(r.reliable).toBe(false);
    expect(r.completeness).toBe(0);
    expect(r.nextActions.join(" ")).toMatch(/hỏi thêm/i);
  });

  it("dimensions are weighted to 1.0 and score stays within 0–100", () => {
    const d = inferDiscovery({ nganh_nghe: opt("nganh_nghe", "Quản lý") });
    const r = scoreLead({ discovery: d });
    const wsum = r.dimensions.reduce((s, x) => s + x.weight, 0);
    expect(Math.abs(wsum - 1)).toBeLessThan(1e-9);
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
