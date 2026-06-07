import { describe, it, expect } from "vitest";
import { assessCustomer, explainAssessSale, explainAssessCustomer, type CustomerProfile, type BankPolicy } from "./assess";

const near = (a: number, b: number, tol = 1) => Math.abs(a - b) <= tol;

const POLICY: BankPolicy = { id: "std", name: "std", dsrCap: 60, ltvCap: 70, maxAge: 70, annualRate: 12, maxTermMonths: 300 };

const baseProfile = (over: Partial<CustomerProfile> = {}): CustomerProfile => ({
  incomes: [{ label: "Lương", amount: 40_000_000, proven: true, variable: false }],
  coBorrowerIncome: 0,
  dependents: 0,
  livingCostOverride: 0, // turn living-cost off so DSR is the binding constraint
  debts: [],
  creditCards: [],
  age: 35,
  downPaymentPercent: 30,
  ...over,
});

describe("qualified income", () => {
  it("excludes unproven cash income and discounts irregular income", () => {
    const r = assessCustomer({
      policy: POLICY,
      profile: baseProfile({
        incomes: [
          { label: "Lương", amount: 30_000_000, proven: true, variable: false },
          { label: "Thưởng", amount: 10_000_000, proven: true, variable: true }, // ×70%
          { label: "Tiền mặt", amount: 20_000_000, proven: false, variable: false }, // excluded
        ],
        coBorrowerIncome: 5_000_000,
      }),
    });
    // 30 + 10*0.7 + 5 = 42tr
    expect(near(r.qualifiedIncome, 42_000_000)).toBe(true);
    expect(near(r.cashIncome, 20_000_000)).toBe(true);
    expect(near(r.totalDeclaredIncome, 65_000_000)).toBe(true);
  });
});

describe("capacity & DSR binding", () => {
  it("DSR cap limits the new payment when living cost is off", () => {
    const r = assessCustomer({ policy: POLICY, profile: baseProfile({ debts: [{ label: "Xe", monthly: 5_000_000 }] }) });
    // byDsr = 40*0.6 - 5 = 19tr
    expect(near(r.existingObligations, 5_000_000)).toBe(true);
    expect(near(r.maxMonthlyPayment, 19_000_000)).toBe(true);
    expect(near(r.dsrCurrent, 12.5, 0.1)).toBe(true);
  });

  it("credit-card limit adds a 5% monthly obligation", () => {
    const r = assessCustomer({ policy: POLICY, profile: baseProfile({ creditCards: [{ label: "Visa", limit: 100_000_000 }] }) });
    expect(near(r.existingObligations, 5_000_000)).toBe(true); // 5% of 100tr
  });

  it("living cost can be the tighter constraint", () => {
    const r = assessCustomer({ policy: POLICY, profile: baseProfile({ livingCostOverride: 30_000_000 }) });
    // byCashflow = 40 - 30 - 0 = 10tr < byDsr (24tr)
    expect(near(r.maxMonthlyPayment, 10_000_000)).toBe(true);
  });
});

describe("age caps the term", () => {
  it("term = min(product cap, (maxAge-age)*12)", () => {
    const young = assessCustomer({ policy: POLICY, profile: baseProfile({ age: 35 }) });
    expect(young.effectiveTermMonths).toBe(300); // capped by product (25y) since 35y room=35y
    const old = assessCustomer({ policy: POLICY, profile: baseProfile({ age: 60 }) });
    expect(old.effectiveTermMonths).toBe(120); // (70-60)*12
    expect(old.maxLoan).toBeLessThan(young.maxLoan); // shorter term → smaller loan
  });
});

describe("max price respects LTV + down payment", () => {
  it("loan ratio = min(ltv, 1-down)", () => {
    const r = assessCustomer({ policy: POLICY, profile: baseProfile({ downPaymentPercent: 30 }) });
    // loanRatio = min(0.7, 0.7) = 0.7
    expect(near(r.maxPropertyPrice, r.maxLoan / 0.7, 5)).toBe(true);
    const r2 = assessCustomer({ policy: POLICY, profile: baseProfile({ downPaymentPercent: 50 }) });
    // loanRatio = min(0.7, 0.5) = 0.5 → bigger price for same loan
    expect(near(r2.maxPropertyPrice, r2.maxLoan / 0.5, 5)).toBe(true);
  });
});

describe("target assessment & verdict", () => {
  it("flags an affordable target as đủ and suggests closing", () => {
    const r = assessCustomer({ policy: POLICY, profile: baseProfile(), targetPrice: 2_000_000_000 });
    expect(r.target).not.toBeNull();
    expect(r.target!.affordable).toBe(true);
    expect(["khoe", "can_bien"]).toContain(r.verdict);
    expect(r.suggestions.join(" ")).toMatch(/đủ lực|Chốt/i);
  });

  it("flags an over-budget target as chưa đủ with a path-to-yes", () => {
    const r = assessCustomer({ policy: POLICY, profile: baseProfile({ debts: [{ label: "Nợ", monthly: 15_000_000 }] }), targetPrice: 5_000_000_000 });
    expect(r.target!.affordable).toBe(false);
    expect(r.target!.loanGap).toBeGreaterThan(0);
    expect(r.verdict).toBe("chua_du");
    // suggestions must offer concrete alternatives, never empty
    expect(r.suggestions.length).toBeGreaterThan(0);
    expect(r.suggestions.join(" ")).toMatch(/vốn|kỳ hạn|đồng vay|căn tầm giá/i);
  });
});

describe("dual-mode framing", () => {
  it("sale view is blunt with a verdict tag; customer view never says 'trượt' and carries the disclaimer", () => {
    const r = assessCustomer({ policy: POLICY, profile: baseProfile({ debts: [{ label: "Nợ", monthly: 15_000_000 }] }), targetPrice: 5_000_000_000 });
    const sale = explainAssessSale(r);
    const cust = explainAssessCustomer(r, "The Privé");
    expect(sale.lines[0]).toMatch(/HOT|ẤM|NGUỘI/);
    expect(cust.title).toContain("The Privé");
    expect(cust.copyText.toLowerCase()).not.toContain("trượt");
    expect(cust.copyText).toMatch(/KHÔNG phải cam kết phê duyệt/);
    // customer view leads with monthly payment framing
    expect(cust.lines.join(" ")).toMatch(/Trả góp|thu nhập/);
  });
});
