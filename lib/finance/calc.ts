// Pure finance calculators. No IO, no rounding-for-display (keep full precision
// here; format at the edge). Each function is covered by calc.test.ts.

import type {
  AmortInput,
  AmortResult,
  AmortRow,
  AffordInput,
  AffordResult,
  ScheduleInput,
  ScheduleResult,
  RentalInput,
  RentalResult,
} from "./types";

// Monthly payment for a reducing-balance (annuity) loan over `n` months.
// i = 0 → straight division. Used both forward (amortize) and to recompute the
// payment when a rate phase changes.
function annuityPayment(balance: number, annualRate: number, n: number): number {
  if (n <= 0) return 0;
  const i = annualRate / 100 / 12;
  if (i === 0) return balance / n;
  return (balance * i) / (1 - Math.pow(1 + i, -n));
}

// ── Trả góp ────────────────────────────────────────────────────────────────
// Builds the full month-by-month schedule. Supports a promo phase (promoMonths
// at promoRate) then the floating rate; the reducing-balance payment is
// recomputed at the start of each phase over the remaining balance & term,
// matching how Vietnamese banks reset the instalment after ưu đãi ends.
export function amortize(input: AmortInput): AmortResult {
  const { loanAmount, termMonths, method } = input;
  const promoMonths = Math.max(0, Math.floor(input.promoMonths ?? 0));
  const hasPromo = promoMonths > 0 && input.promoRate != null;

  const rateFor = (m: number) =>
    hasPromo && m <= promoMonths ? (input.promoRate as number) : input.annualRate;

  const rows: AmortRow[] = [];
  let balance = loanAmount;
  let annuity = 0;
  let promoMonthlyPayment: number | null = null;
  let postPromoFirstPayment: number | null = null;

  for (let m = 1; m <= termMonths; m++) {
    const annual = rateFor(m);
    const i = annual / 100 / 12;

    if (method === "reducing" && (m === 1 || (hasPromo && m === promoMonths + 1))) {
      annuity = annuityPayment(balance, annual, termMonths - m + 1);
    }

    let interest = balance * i;
    let principal: number;
    let payment: number;

    if (method === "fixed_principal") {
      principal = loanAmount / termMonths;
      payment = principal + interest;
    } else {
      payment = annuity;
      principal = payment - interest;
    }

    // Final month (or float rounding) clears whatever is left.
    if (m === termMonths || principal > balance) {
      principal = balance;
      payment = principal + interest;
    }

    balance = Math.max(0, balance - principal);
    rows.push({ month: m, rate: annual, payment, interest, principal, balance });

    if (hasPromo && m === promoMonths) promoMonthlyPayment = payment;
    if (hasPromo && m === promoMonths + 1) postPromoFirstPayment = payment;
  }

  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPaid = rows.reduce((s, r) => s + r.payment, 0);

  return {
    rows,
    firstPayment: rows[0]?.payment ?? 0,
    lastPayment: rows[rows.length - 1]?.payment ?? 0,
    maxPayment: rows.reduce((m, r) => Math.max(m, r.payment), 0),
    totalInterest,
    totalPaid,
    promoMonthlyPayment,
    postPromoFirstPayment,
  };
}

// ── Khả năng vay tối đa ──────────────────────────────────────────────────────
// Inverse of the annuity formula: from disposable income → max loan → max price.
export function affordability(input: AffordInput): AffordResult {
  const { monthlyIncome, existingDebt, dtiPercent, annualRate, termMonths, downPaymentPercent } =
    input;

  const maxMonthlyPayment = Math.max(0, (monthlyIncome * dtiPercent) / 100 - existingDebt);

  const i = annualRate / 100 / 12;
  const maxLoan =
    i === 0
      ? maxMonthlyPayment * termMonths
      : (maxMonthlyPayment * (1 - Math.pow(1 + i, -termMonths))) / i;

  const loanRatio = 1 - downPaymentPercent / 100; // phần được vay trên giá
  const maxPropertyPrice = loanRatio > 0 ? maxLoan / loanRatio : maxLoan;
  const requiredDownPayment = (maxPropertyPrice * downPaymentPercent) / 100;

  return { maxMonthlyPayment, maxLoan, maxPropertyPrice, requiredDownPayment };
}

// ── Lịch thanh toán theo tiến độ ─────────────────────────────────────────────
export function schedule(input: ScheduleInput): ScheduleResult {
  const { price, installments } = input;
  let cumulative = 0;
  const rows = installments.map((it) => {
    const amount = (price * it.percent) / 100;
    cumulative += amount;
    return {
      label: it.label,
      percent: it.percent,
      amount,
      cumulative,
      remaining: Math.max(0, price - cumulative),
      due: it.due ?? null,
    };
  });
  const totalPercent = installments.reduce((s, it) => s + it.percent, 0);
  return {
    rows,
    totalPercent,
    totalAmount: rows.reduce((s, r) => s + r.amount, 0),
    balanced: Math.abs(totalPercent - 100) < 0.01,
  };
}

// ── Dòng tiền cho thuê ───────────────────────────────────────────────────────
// Reference only — never a profit guarantee (see disclaimer.ts). Gross yield is
// a neutral descriptive ratio, not a promised return.
export function rental(input: RentalInput): RentalResult {
  const { price, monthlyLoanPayment, monthlyRent, occupancyPercent, monthlyCosts } = input;
  const effectiveRent = (monthlyRent * occupancyPercent) / 100;
  const monthlyNet = effectiveRent - monthlyLoanPayment - monthlyCosts;
  return {
    effectiveRent,
    monthlyNet,
    annualNet: monthlyNet * 12,
    grossYieldPercent: price > 0 ? ((monthlyRent * 12) / price) * 100 : 0,
    positive: monthlyNet >= 0,
  };
}
