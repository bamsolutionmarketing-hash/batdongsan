import { describe, it, expect } from "vitest";
import { inferDiscovery, explainDiscovery, QUESTIONS } from "./discovery";

const M = 1_000_000;
// resolve an option index by matching a substring of its label
const opt = (qid: string, needle: string) => {
  const q = QUESTIONS.find((x) => x.id === qid)!;
  const i = q.options.findIndex((o) => o.label.includes(needle));
  if (i < 0) throw new Error(`no option ${needle} in ${qid}`);
  return i;
};

describe("inferDiscovery — income from indirect signals", () => {
  it("aggregates a high-earner picture into a high band", () => {
    const r = inferDiscovery({
      nganh_nghe: opt("nganh_nghe", "Giám đốc"),
      gio_giac: opt("gio_giac", "công tác"),
      xe: opt("xe", "Ô tô sang"),
      truong_con: opt("truong_con", "Quốc tế"),
    });
    expect(r.incomeBand).not.toBeNull();
    expect(r.incomeMid! / M).toBeGreaterThan(70); // clearly high
    expect(r.jobLabel).toBe("Cấp cao/Điều hành");
    expect(r.confidence).toBe("cao"); // 4 agreeing high signals
  });

  it("aggregates an entry-level picture into a modest band", () => {
    const r = inferDiscovery({
      nganh_nghe: opt("nganh_nghe", "Nhân viên"),
      xe: opt("xe", "Xe máy phổ thông"),
      cho_o: opt("cho_o", "Đang thuê"),
    });
    expect(r.incomeMid! / M).toBeLessThan(35);
    expect(r.jobLabel).toBe("Nhân viên");
    expect(r.intent).toBe("o_thuc"); // renting → buy-to-live
  });

  it("falls back to job-level baseline when no explicit income option chosen", () => {
    const r = inferDiscovery({ gio_giac: opt("gio_giac", "Hành chính") });
    // only a weak jobLevel signal, no income range → baseline nhanvien 15–30
    expect(r.incomeBand).toEqual({ low: 15 * M, high: 30 * M });
    expect(r.confidence).toBe("thap");
  });
});

describe("inferDiscovery — household, intent, capital", () => {
  it("derives rooms/dependents/decision from family answer", () => {
    const r = inferDiscovery({ ho_gia_dinh: opt("ho_gia_dinh", "2 con") });
    expect(r.rooms).toBe(3);
    expect(r.dependents).toBe(2);
    expect(r.decision).toBe("vo_chong");
  });

  it("explicit goal answer wins the intent", () => {
    const r = inferDiscovery({
      cho_o: opt("cho_o", "Đã có 1 nhà"), // would lean dau_tu
      muc_dich: opt("muc_dich", "Mua để ở"), // explicit → o_thuc wins
    });
    expect(r.intent).toBe("o_thuc");
  });

  it("maps down-payment hint and investor heuristic", () => {
    const cash = inferDiscovery({ vay_von: opt("vay_von", "Trả thẳng") });
    expect(cash.downHint).toBe(70);
    const investor = inferDiscovery({ muc_dich: opt("muc_dich", "Đầu tư") });
    expect(investor.handoff.downPaymentPercent).toBe(40); // investor default equity
  });

  it("budget question yields a target price + feeds handoff", () => {
    const r = inferDiscovery({ ngan_sach: opt("ngan_sach", "2,5 – 3,5 tỷ") });
    expect(r.targetPrice).toBe(3_000_000_000);
    expect(r.handoff.targetPrice).toBe(3_000_000_000);
  });
});

describe("handoff + explain", () => {
  it("handoff carries midpoint income, dependents, down% to the assess engine", () => {
    const r = inferDiscovery({
      nganh_nghe: opt("nganh_nghe", "Quản lý"),
      ho_gia_dinh: opt("ho_gia_dinh", "2 con"),
      vay_von: opt("vay_von", "một nửa"),
    });
    expect(r.handoff.income).toBe(r.incomeMid);
    expect(r.handoff.dependents).toBe(2);
    expect(r.handoff.downPaymentPercent).toBe(50);
  });

  it("explainDiscovery is sale-facing and lists reasoning notes", () => {
    const r = inferDiscovery({ nganh_nghe: opt("nganh_nghe", "Tự kinh doanh") });
    const ex = explainDiscovery(r);
    expect(ex.lines.join(" ")).toMatch(/Thu nhập ước tính/);
    // self-employed flagged as cash-heavy
    expect(ex.lines.join(" ")).toMatch(/tiền mặt|chứng minh/);
    expect(r.notes.length).toBeGreaterThan(0);
  });

  it("empty answers → safe defaults", () => {
    const r = inferDiscovery({});
    expect(r.answered).toBe(0);
    expect(r.incomeBand).toBeNull();
    expect(r.handoff.downPaymentPercent).toBe(30);
    expect(explainDiscovery(r).headline).toMatch(/Chưa có/);
  });
});
