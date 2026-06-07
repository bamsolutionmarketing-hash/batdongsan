// Finance calculator engine — shared I/O types. All amounts are in VND (đồng);
// all rates are annual percentages (e.g. 11 = 11%/năm). Pure, no IO — every
// calculator here is unit-tested so sales never quote a wrong number to a buyer.

// ── Trả góp / amortization ─────────────────────────────────────────────────
// reducing       = dư nợ giảm dần (trả đều, lãi tính trên dư nợ còn lại)
// fixed_principal = gốc cố định (gốc đều, lãi giảm dần → tháng đầu trả cao nhất)
export type AmortMethod = "reducing" | "fixed_principal";

export interface AmortInput {
  loanAmount: number; // số tiền vay (VND)
  annualRate: number; // lãi suất sau ưu đãi / thả nổi (%/năm)
  termMonths: number; // kỳ hạn (tháng)
  method: AmortMethod;
  promoRate?: number | null; // lãi suất ưu đãi (%/năm)
  promoMonths?: number | null; // số tháng ưu đãi
}

export interface AmortRow {
  month: number; // 1-based
  rate: number; // lãi suất năm áp dụng tháng này (%)
  payment: number; // tổng phải trả tháng này (gốc + lãi)
  interest: number; // phần lãi
  principal: number; // phần gốc
  balance: number; // dư nợ cuối kỳ
}

export interface AmortResult {
  rows: AmortRow[];
  firstPayment: number; // tháng 1
  lastPayment: number; // tháng cuối
  maxPayment: number; // tháng phải trả cao nhất (áp lực dòng tiền)
  totalInterest: number; // tổng lãi cả kỳ
  totalPaid: number; // tổng gốc + lãi
  promoMonthlyPayment: number | null; // trả/tháng trong kỳ ưu đãi (reducing)
  postPromoFirstPayment: number | null; // trả/tháng ngay sau ưu đãi (cú sốc lãi thả nổi)
}

// ── Khả năng vay tối đa / affordability ────────────────────────────────────
export interface AffordInput {
  monthlyIncome: number; // thu nhập/tháng (VND)
  existingDebt: number; // nợ phải trả hiện có/tháng (VND)
  dtiPercent: number; // tỉ lệ tối đa trả nợ / thu nhập (%) — NH thường 50–70
  annualRate: number; // lãi suất dự kiến (%/năm)
  termMonths: number; // kỳ hạn (tháng)
  downPaymentPercent: number; // vốn tự có (% giá trị BĐS), vd 30
}

export interface AffordResult {
  maxMonthlyPayment: number; // khả năng trả nợ/tháng còn lại
  maxLoan: number; // số tiền vay tối đa
  maxPropertyPrice: number; // giá BĐS tối đa mua được
  requiredDownPayment: number; // vốn tự có cần có cho mức giá đó
}

// ── Lịch thanh toán theo tiến độ / progress schedule ───────────────────────
export interface Installment {
  label: string; // tên đợt, vd "Đặt cọc", "Đợt 1 — ký HĐMB"
  percent: number; // % giá trị BĐS
  due?: string | null; // mốc thời gian (text tự do, vd "07/2026")
}

export interface ScheduleInput {
  price: number; // giá BĐS (VND)
  installments: Installment[];
}

export interface ScheduleRow {
  label: string;
  percent: number;
  amount: number; // số tiền đợt này
  cumulative: number; // luỹ kế đã đóng
  remaining: number; // còn lại
  due: string | null;
}

export interface ScheduleResult {
  rows: ScheduleRow[];
  totalPercent: number;
  totalAmount: number;
  balanced: boolean; // tổng % có ≈ 100 không
}

// ── Dòng tiền cho thuê / rental cashflow ───────────────────────────────────
export interface RentalInput {
  price: number; // giá mua (VND)
  monthlyLoanPayment: number; // trả nợ vay/tháng (0 nếu mua đứt)
  monthlyRent: number; // giá thuê kỳ vọng/tháng (VND)
  occupancyPercent: number; // tỉ lệ lấp đầy (%) — vd 90 nếu trống ~1 tháng/năm
  monthlyCosts: number; // phí quản lý/bảo trì/khác per tháng (VND)
}

export interface RentalResult {
  effectiveRent: number; // tiền thuê thực nhận sau lấp đầy
  monthlyNet: number; // dòng tiền ròng/tháng (có thể âm)
  annualNet: number; // dòng tiền ròng/năm
  grossYieldPercent: number; // tỉ suất cho thuê gộp tham khảo = thuê*12/giá
  positive: boolean; // dòng tiền dương?
}

// ── PDF report (client-safe types; renderer lives in report.ts server-only) ──
export interface ReportTable {
  heading: string;
  head: string[]; // column headers
  rows: string[][]; // cell text (col0 left-aligned, rest right-aligned)
}

export interface ReportPayload {
  title: string;
  subtitle?: string | null;
  bullets: string[]; // plain-language explanation
  summary: { label: string; value: string }[]; // key figures
  tables: ReportTable[];
}
