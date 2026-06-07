// The "anti-finance-illiteracy" layer: turns raw numbers into plain Vietnamese a
// sales agent can read aloud to a buyer, plus a ready-to-paste copy block. Every
// copy block ends with the compliance disclaimer.

import type {
  AmortInput,
  AmortResult,
  AffordInput,
  AffordResult,
  ScheduleInput,
  ScheduleResult,
  RentalInput,
  RentalResult,
} from "./types";
import { compactVnd, vnd, pct } from "./format";
import { DISCLAIMER } from "./disclaimer";

export interface Explained {
  title: string;
  lines: string[]; // bullet explanations shown on screen
  copyText: string; // ready to paste into Zalo/inbox (no branding yet)
}

const yearsLabel = (months: number) =>
  months % 12 === 0 ? `${months / 12} năm` : `${months} tháng`;

const block = (title: string, body: string[]) =>
  `📊 ${title}\n${body.map((b) => `• ${b}`).join("\n")}\n\n${DISCLAIMER}`;

// ── Trả góp ──────────────────────────────────────────────────────────────────
export function explainAmort(input: AmortInput, r: AmortResult): Explained {
  const lines: string[] = [];
  const promo = input.promoMonths && input.promoRate != null && input.promoMonths > 0;

  if (promo) {
    lines.push(
      `Vay ${compactVnd(input.loanAmount)} trong ${yearsLabel(input.termMonths)}, ưu đãi ${pct(input.promoRate as number)}/năm trong ${input.promoMonths} tháng đầu rồi thả nổi ${pct(input.annualRate)}/năm.`,
    );
    lines.push(`Trong kỳ ưu đãi: trả khoảng ${compactVnd(r.promoMonthlyPayment ?? r.firstPayment)}/tháng.`);
    if (r.postPromoFirstPayment != null) {
      const jump = r.postPromoFirstPayment - (r.promoMonthlyPayment ?? r.firstPayment);
      lines.push(
        `Hết ưu đãi: tăng lên ~${compactVnd(r.postPromoFirstPayment)}/tháng (tăng ~${compactVnd(jump)}). Cần chuẩn bị trước cho mức tăng này.`,
      );
    }
  } else if (input.method === "fixed_principal") {
    lines.push(
      `Vay ${compactVnd(input.loanAmount)} trong ${yearsLabel(input.termMonths)}, gốc đều, lãi ${pct(input.annualRate)}/năm.`,
    );
    lines.push(`Tháng đầu trả cao nhất ~${compactVnd(r.firstPayment)}, giảm dần còn ~${compactVnd(r.lastPayment)} tháng cuối.`);
  } else {
    lines.push(
      `Vay ${compactVnd(input.loanAmount)} trong ${yearsLabel(input.termMonths)}, lãi ${pct(input.annualRate)}/năm.`,
    );
    lines.push(`Trả đều khoảng ${compactVnd(r.firstPayment)}/tháng.`);
  }
  lines.push(`Tháng phải trả cao nhất: ${compactVnd(r.maxPayment)} — dùng mức này để xét khả năng chi trả.`);
  lines.push(`Tổng lãi cả kỳ: ~${compactVnd(r.totalInterest)}. Tổng phải trả: ~${compactVnd(r.totalPaid)}.`);

  return {
    title: "Trả góp khoản vay",
    lines,
    copyText: block("Dự tính trả góp", [
      `Vay ${vnd(input.loanAmount)} • ${yearsLabel(input.termMonths)}`,
      promo
        ? `Ưu đãi ${pct(input.promoRate as number)} (${input.promoMonths} tháng) → thả nổi ${pct(input.annualRate)}`
        : `Lãi ${pct(input.annualRate)}/năm`,
      `Trả/tháng kỳ đầu: ${vnd(r.firstPayment)}`,
      r.postPromoFirstPayment != null ? `Sau ưu đãi: ${vnd(r.postPromoFirstPayment)}/tháng` : `Cao nhất: ${vnd(r.maxPayment)}/tháng`,
      `Tổng lãi: ${vnd(r.totalInterest)} • Tổng trả: ${vnd(r.totalPaid)}`,
    ]),
  };
}

// ── Khả năng vay tối đa ───────────────────────────────────────────────────────
export function explainAfford(input: AffordInput, r: AffordResult): Explained {
  const lines = [
    `Thu nhập ${compactVnd(input.monthlyIncome)}/tháng, đang trả nợ ${compactVnd(input.existingDebt)}/tháng.`,
    `Ngân hàng cho dành tối đa ${pct(input.dtiPercent)} thu nhập để trả nợ → còn ~${compactVnd(r.maxMonthlyPayment)}/tháng cho khoản vay mới.`,
    `Tương ứng vay tối đa ~${compactVnd(r.maxLoan)} (lãi ${pct(input.annualRate)}, ${yearsLabel(input.termMonths)}).`,
    `Với vốn tự có ${pct(input.downPaymentPercent)}, mua được BĐS giá tối đa ~${compactVnd(r.maxPropertyPrice)}.`,
    `Cần chuẩn bị vốn tự có ~${compactVnd(r.requiredDownPayment)}.`,
  ];
  return {
    title: "Khả năng vay & ngân sách",
    lines,
    copyText: block("Khả năng tài chính", [
      `Thu nhập: ${vnd(input.monthlyIncome)}/tháng`,
      `Trả nợ tối đa thêm: ${vnd(r.maxMonthlyPayment)}/tháng`,
      `Vay tối đa: ${vnd(r.maxLoan)}`,
      `Mua được giá tối đa: ${vnd(r.maxPropertyPrice)}`,
      `Vốn tự có cần: ${vnd(r.requiredDownPayment)}`,
    ]),
  };
}

// ── Lịch thanh toán theo tiến độ ─────────────────────────────────────────────
export function explainSchedule(input: ScheduleInput, r: ScheduleResult): Explained {
  const heaviest = r.rows.reduce((a, b) => (b.amount > a.amount ? b : a), r.rows[0]);
  const lines = [
    `Giá BĐS ${compactVnd(input.price)}, chia ${r.rows.length} đợt.`,
    heaviest ? `Đợt nặng nhất: "${heaviest.label}" ~${compactVnd(heaviest.amount)} (${pct(heaviest.percent)}).` : "",
    r.balanced
      ? `Tổng các đợt = 100% giá trị — khớp.`
      : `⚠️ Tổng các đợt = ${pct(r.totalPercent)}, chưa đủ 100% — kiểm tra lại tiến độ.`,
  ].filter(Boolean);
  return {
    title: "Lịch thanh toán theo tiến độ",
    lines,
    copyText: block("Lịch thanh toán", [
      `Giá: ${vnd(input.price)}`,
      ...r.rows.map((row) => `${row.label} (${pct(row.percent)}): ${vnd(row.amount)}${row.due ? ` — ${row.due}` : ""}`),
    ]),
  };
}

// ── Dòng tiền cho thuê ───────────────────────────────────────────────────────
export function explainRental(input: RentalInput, r: RentalResult): Explained {
  const sign = r.positive ? "dương" : "âm";
  const lines = [
    `Giá thuê kỳ vọng ${compactVnd(input.monthlyRent)}/tháng, lấp đầy ${pct(input.occupancyPercent)} → thực nhận ~${compactVnd(r.effectiveRent)}/tháng.`,
    `Trừ trả nợ vay ${compactVnd(input.monthlyLoanPayment)} và chi phí ${compactVnd(input.monthlyCosts)}/tháng.`,
    `Dòng tiền ròng: ~${compactVnd(r.monthlyNet)}/tháng (${sign}), tức ~${compactVnd(r.annualNet)}/năm.`,
    `Tỉ suất cho thuê gộp tham khảo: ${pct(r.grossYieldPercent)}/năm (chưa trừ chi phí, chỉ để so sánh).`,
  ];
  return {
    title: "Dòng tiền cho thuê",
    lines,
    copyText: block("Dòng tiền cho thuê (tham khảo)", [
      `Thuê: ${vnd(input.monthlyRent)}/tháng • lấp đầy ${pct(input.occupancyPercent)}`,
      `Trả nợ: ${vnd(input.monthlyLoanPayment)}/tháng • chi phí ${vnd(input.monthlyCosts)}/tháng`,
      `Dòng tiền ròng: ${vnd(r.monthlyNet)}/tháng (${sign})`,
    ]),
  };
}
