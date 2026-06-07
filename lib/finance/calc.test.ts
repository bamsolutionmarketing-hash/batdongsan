import { describe, it, expect } from "vitest";
import { amortize, affordability, schedule, rental } from "./calc";

const near = (a: number, b: number, tol = 1) => Math.abs(a - b) <= tol;

describe("amortize — reducing balance", () => {
  it("zero interest splits principal evenly and clears the balance", () => {
    const r = amortize({ loanAmount: 1_200_000_000, annualRate: 0, termMonths: 12, method: "reducing" });
    expect(near(r.firstPayment, 100_000_000)).toBe(true);
    expect(r.totalInterest).toBe(0);
    expect(near(r.rows[r.rows.length - 1].balance, 0)).toBe(true);
    expect(near(r.totalPaid, 1_200_000_000)).toBe(true);
  });

  it("matches the annuity formula (12%/yr, 12 months)", () => {
    const r = amortize({ loanAmount: 1_000_000_000, annualRate: 12, termMonths: 12, method: "reducing" });
    // P*i/(1-(1+i)^-n), i=0.01 → ≈ 88,848,790
    expect(near(r.firstPayment, 88_848_790, 50)).toBe(true);
    expect(near(r.rows[r.rows.length - 1].balance, 0, 5)).toBe(true);
    // total interest must be positive and < total paid
    expect(r.totalInterest).toBeGreaterThan(0);
    expect(r.totalPaid).toBeGreaterThan(1_000_000_000);
  });

  it("payment stays flat across months (reducing/annuity)", () => {
    const r = amortize({ loanAmount: 2_000_000_000, annualRate: 10, termMonths: 60, method: "reducing" });
    const first = r.rows[0].payment;
    const mid = r.rows[30].payment;
    expect(near(first, mid, 5)).toBe(true); // annuity → constant payment
    // but principal grows while interest shrinks over time
    expect(r.rows[30].principal).toBeGreaterThan(r.rows[0].principal);
    expect(r.rows[30].interest).toBeLessThan(r.rows[0].interest);
  });
});

describe("amortize — fixed principal", () => {
  it("equal principal, decreasing payment", () => {
    const r = amortize({ loanAmount: 1_200_000_000, annualRate: 12, termMonths: 24, method: "fixed_principal" });
    expect(near(r.rows[0].principal, r.rows[10].principal, 1)).toBe(true); // gốc đều
    expect(r.firstPayment).toBeGreaterThan(r.lastPayment); // lãi giảm dần
    expect(near(r.rows[r.rows.length - 1].balance, 0, 5)).toBe(true);
  });
});

describe("amortize — promo then floating", () => {
  it("jumps to a higher payment after the promo period", () => {
    const r = amortize({
      loanAmount: 2_000_000_000,
      annualRate: 12,
      termMonths: 240,
      method: "reducing",
      promoRate: 6,
      promoMonths: 12,
    });
    expect(r.promoMonthlyPayment).not.toBeNull();
    expect(r.postPromoFirstPayment).not.toBeNull();
    expect(r.postPromoFirstPayment as number).toBeGreaterThan(r.promoMonthlyPayment as number);
    // promo months carry the promo rate, month 13 carries the floating rate
    expect(r.rows[0].rate).toBe(6);
    expect(r.rows[11].rate).toBe(6);
    expect(r.rows[12].rate).toBe(12);
    expect(near(r.rows[r.rows.length - 1].balance, 0, 50)).toBe(true);
  });
});

describe("affordability", () => {
  it("zero interest: max loan = payment * months", () => {
    const r = affordability({
      monthlyIncome: 40_000_000,
      existingDebt: 0,
      dtiPercent: 50,
      annualRate: 0,
      termMonths: 100,
      downPaymentPercent: 0,
    });
    expect(near(r.maxMonthlyPayment, 20_000_000)).toBe(true);
    expect(near(r.maxLoan, 2_000_000_000)).toBe(true);
    expect(near(r.maxPropertyPrice, 2_000_000_000)).toBe(true);
  });

  it("down payment scales the affordable price up", () => {
    const r = affordability({
      monthlyIncome: 50_000_000,
      existingDebt: 10_000_000,
      dtiPercent: 60,
      annualRate: 0,
      termMonths: 100,
      downPaymentPercent: 30,
    });
    // disposable = 50*0.6 - 10 = 20tr → loan 2 tỷ → price = 2 / 0.7
    expect(near(r.maxMonthlyPayment, 20_000_000)).toBe(true);
    expect(near(r.maxLoan, 2_000_000_000)).toBe(true);
    expect(near(r.maxPropertyPrice, 2_000_000_000 / 0.7, 10)).toBe(true);
    expect(near(r.requiredDownPayment, (2_000_000_000 / 0.7) * 0.3, 10)).toBe(true);
  });

  it("over-indebted income yields zero capacity, not negative", () => {
    const r = affordability({
      monthlyIncome: 20_000_000,
      existingDebt: 15_000_000,
      dtiPercent: 50,
      annualRate: 10,
      termMonths: 120,
      downPaymentPercent: 30,
    });
    expect(r.maxMonthlyPayment).toBe(0);
    expect(r.maxLoan).toBe(0);
  });
});

describe("schedule", () => {
  it("computes amounts, cumulative and balance flag", () => {
    const r = schedule({
      price: 3_000_000_000,
      installments: [
        { label: "Cọc", percent: 10 },
        { label: "Đợt 1", percent: 40 },
        { label: "Nhận nhà", percent: 50 },
      ],
    });
    expect(near(r.rows[0].amount, 300_000_000)).toBe(true);
    expect(near(r.rows[2].cumulative, 3_000_000_000)).toBe(true);
    expect(near(r.rows[2].remaining, 0)).toBe(true);
    expect(r.balanced).toBe(true);
    expect(near(r.totalAmount, 3_000_000_000)).toBe(true);
  });

  it("flags an unbalanced schedule", () => {
    const r = schedule({ price: 1_000_000_000, installments: [{ label: "A", percent: 80 }] });
    expect(r.balanced).toBe(false);
    expect(r.totalPercent).toBe(80);
  });
});

describe("rental", () => {
  it("nets rent against loan + costs and flags negative cashflow", () => {
    const r = rental({
      price: 3_000_000_000,
      monthlyLoanPayment: 18_000_000,
      monthlyRent: 12_000_000,
      occupancyPercent: 100,
      monthlyCosts: 1_000_000,
    });
    expect(near(r.effectiveRent, 12_000_000)).toBe(true);
    expect(near(r.monthlyNet, -7_000_000)).toBe(true);
    expect(r.positive).toBe(false);
    expect(near(r.annualNet, -84_000_000)).toBe(true);
    // gross yield = 12tr*12 / 3 tỷ = 4.8%
    expect(near(r.grossYieldPercent, 4.8, 0.01)).toBe(true);
  });

  it("occupancy reduces effective rent", () => {
    const r = rental({
      price: 2_000_000_000,
      monthlyLoanPayment: 0,
      monthlyRent: 10_000_000,
      occupancyPercent: 90,
      monthlyCosts: 0,
    });
    expect(near(r.effectiveRent, 9_000_000)).toBe(true);
    expect(r.positive).toBe(true);
  });
});
