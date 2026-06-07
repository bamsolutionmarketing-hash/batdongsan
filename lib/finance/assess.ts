// Customer financial-capacity engine. Pure (no IO) so it's unit-tested and runs
// on client or server. Produces neutral facts; the framing into a blunt
// SALE-facing read vs a positive CUSTOMER-facing "kế hoạch sở hữu" lives in the
// explain layer / UI. Closing logic is reverse-engineered: always surface a
// path-to-yes (more down / longer term / co-borrower / cheaper unit) instead of
// a dead "không đủ".

import { compactVnd, pct } from "./format";

// Compliance: estimates only, not a bank approval; advise CIC check.
export const ASSESS_DISCLAIMER =
  "Đây là ước tính sơ bộ dựa trên thông tin khách cung cấp — KHÔNG phải cam kết phê duyệt của ngân hàng. Hạn mức & lãi suất thực tế do ngân hàng quyết định; nên kiểm tra lịch sử tín dụng (CIC) trước khi xuống tiền.";

// ── Defaults (all overridable from the UI) ───────────────────────────────────
export const VARIABLE_FACTOR = 70; // % of irregular income (thưởng/hoa hồng) counted
export const CC_FACTOR = 5; // % of credit-card limit treated as monthly obligation
export const LIVING_PER_PERSON = 3_000_000; // VND/người/tháng (gồm cả người vay)

// ── Inputs ───────────────────────────────────────────────────────────────────
export interface IncomeLine {
  label: string;
  amount: number; // VND/tháng
  proven: boolean; // chứng minh được qua ngân hàng
  variable: boolean; // thu nhập biến động → nhân hệ số
}
export interface DebtLine { label: string; monthly: number }
export interface CreditCard { label: string; limit: number }

export interface CustomerProfile {
  incomes: IncomeLine[];
  coBorrowerIncome: number; // thu nhập người đồng vay (coi là chứng minh được)
  dependents: number; // số người phụ thuộc
  livingCostOverride: number | null; // tự nhập tổng chi phí sống (ghi đè định mức)
  debts: DebtLine[];
  creditCards: CreditCard[];
  age: number; // tuổi người vay chính
  downPaymentPercent: number; // vốn tự có dự kiến (% giá BĐS)
  variableFactor?: number;
  ccFactor?: number;
  livingPerPerson?: number;
}

export interface BankPolicy {
  id: string;
  name: string;
  dsrCap: number; // % tổng trả nợ / thu nhập
  ltvCap: number; // % vay tối đa trên giá BĐS
  maxAge: number; // tuổi + kỳ hạn ≤ maxAge
  annualRate: number; // %/năm dùng để xét khả năng (lãi thật/thả nổi)
  maxTermMonths: number; // trần kỳ hạn sản phẩm
}

export interface AssessInput {
  profile: CustomerProfile;
  policy: BankPolicy;
  targetPrice?: number | null; // giá căn đang nhắm (tùy chọn)
}

// ── Output ───────────────────────────────────────────────────────────────────
export type Band = "khoe" | "can_bien" | "chua_du";

export interface TargetAssessment {
  price: number;
  loanRatio: number; // phần được vay trên giá (sau khi xét LTV + vốn tự có)
  requiredLoan: number;
  requiredDown: number;
  monthlyPayment: number;
  dsrAtTarget: number; // (nợ cũ + khoản mới) / thu nhập (%)
  affordable: boolean;
  loanGap: number; // requiredLoan - maxLoan (>0 = thiếu)
}

export interface AssessResult {
  totalDeclaredIncome: number;
  qualifiedIncome: number; // thu nhập ngân hàng tính (chứng minh + biến động×hệ số + đồng vay)
  cashIncome: number; // phần không chứng minh (upside, không tính vào khả năng)
  livingCost: number;
  existingObligations: number; // nợ + thẻ
  dsrCurrent: number; // nợ cũ / thu nhập (%)
  maxMonthlyPayment: number; // khả năng trả khoản MỚI / tháng
  effectiveTermMonths: number; // sau ràng buộc tuổi
  maxLoan: number;
  maxPropertyPrice: number;
  band: Band;
  verdict: Band; // kết hợp DSR + (nếu có) mua nổi căn X
  target: TargetAssessment | null;
  suggestions: string[]; // luôn là "đường tới yes" với con số cụ thể
}

// ── math ─────────────────────────────────────────────────────────────────────
function annuityPayment(loan: number, annualRate: number, n: number): number {
  if (n <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i === 0) return loan / n;
  return (loan * i) / (1 - Math.pow(1 + i, -n));
}
function loanFromPayment(payment: number, annualRate: number, n: number): number {
  if (n <= 0 || payment <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i === 0) return payment * n;
  return (payment * (1 - Math.pow(1 + i, -n))) / i;
}
const bandFromDsr = (dsr: number): Band => (dsr < 45 ? "khoe" : dsr <= 60 ? "can_bien" : "chua_du");

// ── core ─────────────────────────────────────────────────────────────────────
export function assessCustomer(input: AssessInput): AssessResult {
  const { profile: p, policy, targetPrice } = input;
  const vf = (p.variableFactor ?? VARIABLE_FACTOR) / 100;
  const ccf = (p.ccFactor ?? CC_FACTOR) / 100;
  const perPerson = p.livingPerPerson ?? LIVING_PER_PERSON;

  const totalDeclaredIncome = p.incomes.reduce((s, x) => s + x.amount, 0) + p.coBorrowerIncome;
  // Bank-facing income: only proven; irregular proven income discounted.
  const qualifiedIncome =
    p.incomes.reduce((s, x) => s + (x.proven ? x.amount * (x.variable ? vf : 1) : 0), 0) + p.coBorrowerIncome;
  const cashIncome = p.incomes.reduce((s, x) => s + (x.proven ? 0 : x.amount), 0);

  const livingCost = p.livingCostOverride != null ? p.livingCostOverride : perPerson * (p.dependents + 1);
  const debtMonthly = p.debts.reduce((s, d) => s + d.monthly, 0);
  const ccMonthly = p.creditCards.reduce((s, c) => s + c.limit * ccf, 0);
  const existingObligations = debtMonthly + ccMonthly;

  const dsrCurrent = qualifiedIncome > 0 ? (existingObligations / qualifiedIncome) * 100 : 0;

  // Capacity for a NEW instalment: bounded by both DSR cap and cash flow after
  // living costs — take the tighter one.
  const byDsr = (qualifiedIncome * policy.dsrCap) / 100 - existingObligations;
  const byCashflow = qualifiedIncome - livingCost - existingObligations;
  const maxMonthlyPayment = Math.max(0, Math.min(byDsr, byCashflow));

  const effectiveTermMonths = Math.max(0, Math.min(policy.maxTermMonths, (policy.maxAge - p.age) * 12));
  const maxLoan = loanFromPayment(maxMonthlyPayment, policy.annualRate, effectiveTermMonths);

  const loanRatio = Math.max(0, Math.min(policy.ltvCap / 100, 1 - p.downPaymentPercent / 100));
  const maxPropertyPrice = loanRatio > 0 ? maxLoan / loanRatio : maxLoan;

  let target: TargetAssessment | null = null;
  if (targetPrice && targetPrice > 0) {
    const requiredLoan = targetPrice * loanRatio;
    const requiredDown = targetPrice - requiredLoan;
    const monthlyPayment = annuityPayment(requiredLoan, policy.annualRate, effectiveTermMonths);
    const dsrAtTarget = qualifiedIncome > 0 ? ((existingObligations + monthlyPayment) / qualifiedIncome) * 100 : 999;
    target = {
      price: targetPrice,
      loanRatio,
      requiredLoan,
      requiredDown,
      monthlyPayment,
      dsrAtTarget,
      affordable: requiredLoan <= maxLoan + 1 && dsrAtTarget <= policy.dsrCap + 0.5,
      loanGap: Math.max(0, requiredLoan - maxLoan),
    };
  }

  const projectedDsr = target ? target.dsrAtTarget : Math.min(policy.dsrCap, dsrCurrent + (maxMonthlyPayment / (qualifiedIncome || 1)) * 100);
  const band = bandFromDsr(projectedDsr);

  // Combined verdict
  let verdict: Band = band;
  if (target) {
    if (target.affordable && band !== "chua_du") verdict = band === "khoe" ? "khoe" : "can_bien";
    else if (target.loanGap > 0 && target.loanGap <= maxLoan * 0.15) verdict = "can_bien";
    else verdict = "chua_du";
  }

  const suggestions = buildSuggestions({ p, policy, maxLoan, maxPropertyPrice, effectiveTermMonths, target });

  return {
    totalDeclaredIncome, qualifiedIncome, cashIncome, livingCost, existingObligations,
    dsrCurrent, maxMonthlyPayment, effectiveTermMonths, maxLoan, maxPropertyPrice,
    band, verdict, target, suggestions,
  };
}

// Path-to-yes — concrete, never a dead end.
function buildSuggestions(a: {
  p: CustomerProfile; policy: BankPolicy; maxLoan: number; maxPropertyPrice: number;
  effectiveTermMonths: number; target: TargetAssessment | null;
}): string[] {
  const { p, policy, maxLoan, maxPropertyPrice, effectiveTermMonths, target } = a;
  const out: string[] = [];
  if (target && !target.affordable) {
    // 1) more down so requiredLoan == maxLoan
    if (maxLoan > 0 && maxLoan < target.requiredLoan) {
      const downNeeded = Math.max(0, 1 - maxLoan / target.price) * 100;
      if (downNeeded <= 90) out.push(`Tăng vốn tự có lên ~${pct(downNeeded)} (≈ ${compactVnd(target.price * downNeeded / 100)}) để khoản vay về mức duyệt được.`);
    }
    // 2) longer term (if age allows)
    const roomMonths = Math.max(0, (policy.maxAge - p.age) * 12) - effectiveTermMonths;
    if (roomMonths >= 12 && effectiveTermMonths < policy.maxTermMonths) {
      out.push(`Kéo dài kỳ hạn (tuổi còn cho phép tới ~${Math.floor((policy.maxAge - p.age))} năm) để giảm trả/tháng.`);
    }
    // 3) co-borrower
    if (p.coBorrowerIncome <= 0) out.push("Thêm người đồng vay (vợ/chồng) để cộng thu nhập — thường mở khoá đủ điều kiện.");
    // 4) cheaper unit
    if (maxPropertyPrice > 0 && maxPropertyPrice < target.price) {
      out.push(`Hoặc chọn căn tầm giá ≤ ${compactVnd(maxPropertyPrice)} (vừa khả năng hiện tại).`);
    }
  } else if (target && target.affordable) {
    out.push(`Khách đủ lực mua căn ${compactVnd(target.price)} — trả ~${compactVnd(target.monthlyPayment)}/tháng. Chốt sớm để giữ chính sách/giá.`);
  } else {
    out.push(`Khả năng mua tới ~${compactVnd(maxPropertyPrice)}. Ưu tiên giới thiệu sản phẩm trong tầm này.`);
  }
  return out;
}

// ── Dual-mode framing ────────────────────────────────────────────────────────
export interface Explained2 { title: string; lines: string[]; copyText: string }

const SALE_VERDICT: Record<Band, string> = {
  khoe: "🟢 KHÁCH HOT — đủ lực, chốt ngay",
  can_bien: "🟡 ẤM — cận biên, cần thu xếp",
  chua_du: "🔴 NGUỘI — chưa đủ, lái sản phẩm/điều kiện",
};

// SALE-facing: blunt qualification + how to steer. NOT for the customer's eyes.
export function explainAssessSale(r: AssessResult): Explained2 {
  const lines = [
    `${SALE_VERDICT[r.verdict]}.`,
    `Thu nhập tính được: ${compactVnd(r.qualifiedIncome)}/tháng${r.cashIncome > 0 ? ` (+${compactVnd(r.cashIncome)} tiền mặt không chứng minh)` : ""}.`,
    `Nợ hiện có: ${compactVnd(r.existingObligations)}/tháng — DSR hiện tại ${pct(r.dsrCurrent)}.`,
    `Khả năng trả khoản mới: ~${compactVnd(r.maxMonthlyPayment)}/tháng → vay tối đa ~${compactVnd(r.maxLoan)}, mua được tới ~${compactVnd(r.maxPropertyPrice)}.`,
  ];
  if (r.target) {
    lines.push(
      r.target.affordable
        ? `Căn ${compactVnd(r.target.price)}: ĐỦ — trả ~${compactVnd(r.target.monthlyPayment)}/tháng (DSR ${pct(r.target.dsrAtTarget)}).`
        : `Căn ${compactVnd(r.target.price)}: THIẾU ~${compactVnd(r.target.loanGap)} hạn mức (DSR ${pct(r.target.dsrAtTarget)}).`,
    );
  }
  r.suggestions.forEach((s) => lines.push(`→ ${s}`));
  return {
    title: "Đánh giá năng lực (nội bộ sale)",
    lines,
    copyText: `📋 ĐÁNH GIÁ KHÁCH (nội bộ)\n${lines.map((l) => `• ${l}`).join("\n")}`,
  };
}

// CUSTOMER-facing: a positive "kế hoạch sở hữu" — leads with monthly payment in
// income context, always a path to yes, never the word "trượt".
export function explainAssessCustomer(r: AssessResult, projectName?: string | null): Explained2 {
  const title = projectName ? `Kế hoạch tài chính sở hữu ${projectName}` : "Kế hoạch tài chính sở hữu";
  const lines: string[] = [];
  if (r.target) {
    const payPct = r.qualifiedIncome > 0 ? (r.target.monthlyPayment / r.qualifiedIncome) * 100 : 0;
    lines.push(`Với căn ${compactVnd(r.target.price)}: chuẩn bị vốn tự có ~${compactVnd(r.target.requiredDown)}, vay ~${compactVnd(r.target.requiredLoan)}.`);
    lines.push(`Trả góp ~${compactVnd(r.target.monthlyPayment)}/tháng — khoảng ${pct(payPct)} thu nhập${payPct <= 45 ? ", trong ngưỡng an toàn" : ""}.`);
    if (!r.target.affordable && r.suggestions.length) {
      lines.push("Lộ trình để sở hữu thuận lợi:");
      r.suggestions.forEach((s) => lines.push(`• ${s}`));
    } else {
      lines.push("Hoàn toàn trong tầm tay — anh/chị chỉ cần quyết định thời điểm.");
    }
  } else {
    lines.push(`Khả năng tài chính cho phép sở hữu bất động sản tới ~${compactVnd(r.maxPropertyPrice)}.`);
    lines.push(`Mức trả góp tương ứng ~${compactVnd(r.maxMonthlyPayment)}/tháng.`);
  }
  return {
    title,
    lines,
    copyText: `🏡 ${title}\n${lines.map((l) => (l.startsWith("•") ? l : `• ${l}`)).join("\n")}\n\n${ASSESS_DISCLAIMER}`,
  };
}
