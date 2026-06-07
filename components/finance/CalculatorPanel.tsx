"use client";

import { useMemo, useRef, useState } from "react";
import { amortize, schedule, rental } from "@/lib/finance/calc";
import { explainAmort, explainSchedule, explainRental, type Explained } from "@/lib/finance/explain";
import { compactVnd, vnd, pct } from "@/lib/finance/format";
import { DISCLAIMER } from "@/lib/finance/disclaimer";
import { RATE_PRESETS, SCHEDULE_PRESETS, BANK_POLICIES } from "@/lib/finance/presets";
import {
  assessCustomer, explainAssessSale, explainAssessCustomer,
  type CustomerProfile, type IncomeLine, type DebtLine, type CreditCard, type BankPolicy, type Band,
} from "@/lib/finance/assess";
import type { AmortMethod, Installment, ReportTable } from "@/lib/finance/types";
import { CountUp, Donut, BalanceChart, Gauge, MiniBars, type BalancePoint, type BarItem } from "./charts";

export interface BrandInfo {
  displayName: string;
  phone: string;
  zalo: string | null;
  logoDataUrl: string | null;
}

type Tab = "loan" | "afford" | "schedule" | "rental";
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "loan", label: "Trả góp", icon: "🏦" },
  { id: "afford", label: "Năng lực KH", icon: "💪" },
  { id: "schedule", label: "Lịch tiến độ", icon: "📅" },
  { id: "rental", label: "Cho thuê", icon: "🔑" },
];

const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

export function CalculatorPanel({ brand }: { brand: BrandInfo | null }) {
  const [tab, setTab] = useState<Tab>("loan");
  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition ${
              tab === t.id ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "loan" && <LoanTab brand={brand} />}
      {tab === "afford" && <CustomerFitTab brand={brand} />}
      {tab === "schedule" && <ScheduleTab brand={brand} />}
      {tab === "rental" && <RentalTab brand={brand} />}
    </div>
  );
}

// ── shared inputs ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, hint, suffix }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-sky-500">
        <input inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent outline-none" />
        {suffix && <span className="shrink-0 text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <span className="text-xs text-sky-500/90">{hint}</span>}
    </label>
  );
}

export interface Metric { label: string; value: number; format: (n: number) => string; color?: string }

// ── the branded, captureable result card + export actions ────────────────────
function ResultCard({
  brand, title, subtitle, chart, metrics, ex, tables,
}: {
  brand: BrandInfo | null;
  title: string;
  subtitle: string;
  chart: React.ReactNode;
  metrics: Metric[];
  ex: Explained;
  tables: ReportTable[];
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"png" | "pdf" | "share" | null>(null);
  const [copied, setCopied] = useState(false);

  const run = async (kind: "png" | "pdf" | "share") => {
    setBusy(kind);
    try {
      // Lazy-load the heavy export libs (jsPDF / html-to-image) only on demand.
      const ex = await import("./exporters");
      if (kind === "png" && cardRef.current) await ex.exportCardPng(cardRef.current, "tai-chinh.png");
      if (kind === "share" && cardRef.current) await ex.shareCardPng(cardRef.current, "tai-chinh.png");
      if (kind === "pdf" && reportRef.current) await ex.exportReportPdf(reportRef.current, "bao-cao-tai-chinh.pdf");
    } finally {
      setBusy(null);
    }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(ex.copyText); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  const Brandline = () => (
    <div className="flex items-center gap-2">
      {brand?.logoDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={brand.logoDataUrl} alt="" className="h-7 w-7 rounded object-contain" />
      )}
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">{brand?.displayName ?? "NhaPilot"}</div>
        {brand?.phone && <div className="text-[11px] text-sky-200/80">{brand.phone}</div>}
      </div>
    </div>
  );

  return (
    <section className="flex flex-col gap-3">
      {/* ── visual card (PNG capture target) ── */}
      <div
        ref={cardRef}
        className="relative overflow-hidden rounded-2xl p-5 text-white"
        style={{ background: "radial-gradient(120% 120% at 0% 0%, #14304f 0%, #0b1220 55%, #0a0f1a 100%)" }}
      >
        <div className="absolute right-0 top-0 h-1.5 w-full bg-gradient-to-r from-sky-400 to-emerald-400" />
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-sky-300/80">📊 Dự tính tài chính</div>
            <h2 className="mt-0.5 text-xl font-bold">{title}</h2>
            <div className="text-xs text-slate-300">{subtitle}</div>
          </div>
          <Brandline />
        </div>

        <div className="my-4 flex justify-center">{chart}</div>

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m, i) => (
            <div key={i} className="rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <div className="text-[11px] text-slate-300">{m.label}</div>
              <CountUp value={m.value} format={m.format} className="text-lg font-bold" />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-snug text-slate-400">{DISCLAIMER}</p>
      </div>

      {/* explanation (on-screen) */}
      <ul className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4 text-sm">
        {ex.lines.map((l, i) => (
          <li key={i} className="flex gap-2"><span className="text-sky-500">›</span><span>{l}</span></li>
        ))}
      </ul>

      {/* actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={copy} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">{copied ? "✓ Đã copy" : "📋 Copy text"}</button>
        <button onClick={() => run("png")} disabled={!!busy} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60">{busy === "png" ? "Đang tạo…" : "🖼️ Tạo ảnh"}</button>
        <button onClick={() => run("share")} disabled={!!busy} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60">{busy === "share" ? "…" : "📤 Chia sẻ"}</button>
        <button onClick={() => run("pdf")} disabled={!!busy} className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white hover:bg-sky-600 disabled:opacity-60">{busy === "pdf" ? "Đang tạo…" : "📄 Xuất PDF"}</button>
      </div>

      {/* hidden A4 report (PDF capture target) */}
      <div aria-hidden className="pointer-events-none fixed -left-[10000px] top-0">
        <div ref={reportRef} style={{ width: 794, background: "#fff", color: "#0f172a", padding: 40, fontFamily: "sans-serif" }}>
          <div style={{ height: 8, background: "linear-gradient(90deg,#38bdf8,#34d399)", borderRadius: 4 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: "#0284c7", fontWeight: 700 }}>📊 BÁO CÁO DỰ TÍNH TÀI CHÍNH</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{title}</div>
              <div style={{ fontSize: 14, color: "#64748b" }}>{subtitle}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {brand?.logoDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={brand.logoDataUrl} alt="" style={{ height: 40, marginLeft: "auto", objectFit: "contain" }} />
              )}
              <div style={{ fontSize: 15, fontWeight: 700 }}>{brand?.displayName ?? "NhaPilot"}</div>
              <div style={{ fontSize: 13, color: "#0284c7" }}>{brand?.phone ?? ""}</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>{chart}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "8px 0 16px" }}>
            {metrics.map((m, i) => (
              <div key={i} style={{ background: i % 2 ? "#f8fafc" : "#eff6ff", borderRadius: 10, padding: "8px 12px" }}>
                <div style={{ fontSize: 12, color: "#475569" }}>{m.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{m.format(m.value)}</div>
              </div>
            ))}
          </div>
          <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 16 }}>
            {ex.lines.map((l, i) => <li key={i} style={{ marginBottom: 4 }}>{l}</li>)}
          </ul>
          {tables.map((t, ti) => (
            <div key={ti} style={{ marginTop: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{t.heading}</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#0f172a", color: "#fff" }}>
                    {t.head.map((h, i) => <th key={i} style={{ padding: "6px 8px", textAlign: i === 0 ? "left" : "right" }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((row, ri) => (
                    <tr key={ri} style={{ background: ri % 2 ? "#f1f5f9" : "#fff" }}>
                      {row.map((c, ci) => <td key={ci} style={{ padding: "4px 8px", textAlign: ci === 0 ? "left" : "right" }}>{c}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <p style={{ marginTop: 16, fontSize: 11, color: "#64748b" }}>{DISCLAIMER}</p>
        </div>
      </div>
    </section>
  );
}

// ── Trả góp ──────────────────────────────────────────────────────────────────
function LoanTab({ brand }: { brand: BrandInfo | null }) {
  const [loan, setLoan] = useState("2000000000");
  const [years, setYears] = useState("20");
  const [rate, setRate] = useState("11");
  const [method, setMethod] = useState<AmortMethod>("reducing");
  const [usePromo, setUsePromo] = useState(true);
  const [promoRate, setPromoRate] = useState("7.5");
  const [promoMonths, setPromoMonths] = useState("12");

  const applyPreset = (id: string) => {
    const p = RATE_PRESETS.find((x) => x.id === id); if (!p) return;
    setMethod(p.method); setRate(String(p.floatingRate)); setUsePromo(p.promoMonths > 0);
    setPromoRate(String(p.promoRate)); setPromoMonths(String(p.promoMonths));
  };

  const input = {
    loanAmount: num(loan), annualRate: Number(rate) || 0, termMonths: (num(years) || 0) * 12,
    method, promoRate: usePromo ? Number(promoRate) || 0 : null, promoMonths: usePromo ? num(promoMonths) : null,
  };
  const result = useMemo(() => amortize(input), [loan, rate, years, method, usePromo, promoRate, promoMonths]); // eslint-disable-line react-hooks/exhaustive-deps
  const ex = explainAmort(input, result);

  const points: BalancePoint[] = [
    { year: 0, balance: input.loanAmount, payment: result.firstPayment },
    ...result.rows.filter((r) => r.month % 12 === 0).map((r) => ({ year: r.month / 12, balance: r.balance, payment: r.payment })),
  ];
  const metrics: Metric[] = [
    { label: usePromo ? "Trả/tháng (ưu đãi)" : "Trả/tháng", value: result.promoMonthlyPayment ?? result.firstPayment, format: compactVnd },
    { label: result.postPromoFirstPayment != null ? "Sau ưu đãi" : "Cao nhất/tháng", value: result.postPromoFirstPayment ?? result.maxPayment, format: compactVnd, color: "#f0883e" },
    { label: "Tổng lãi", value: result.totalInterest, format: compactVnd },
    { label: "Tổng phải trả", value: result.totalPaid, format: compactVnd },
  ];
  const lai = result.totalInterest;
  const chart = (
    <div className="flex w-full flex-col items-center gap-2">
      <Donut
        segments={[{ value: input.loanAmount, color: "#38bdf8", label: "Gốc" }, { value: lai, color: "#fbbf24", label: "Lãi" }]}
        centerTop={pct((lai / (input.loanAmount + lai || 1)) * 100)}
        centerSub="là tiền lãi"
      />
      <div className="flex gap-4 text-[11px]">
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full" style={{ background: "#38bdf8" }} />Gốc {compactVnd(input.loanAmount)}</span>
        <span className="flex items-center gap-1"><i className="inline-block h-2 w-2 rounded-full" style={{ background: "#fbbf24" }} />Lãi {compactVnd(lai)}</span>
      </div>
      <div className="mt-1 w-full"><BalanceChart points={points} promoYear={usePromo ? num(promoMonths) / 12 : null} /></div>
      <div className="text-[10px] text-slate-400">Dư nợ giảm dần (vùng xanh) · tiền trả/tháng (nét vàng)</div>
    </div>
  );
  const tables: ReportTable[] = [
    { heading: "Tổng quan theo năm", head: ["Năm", "Trả/tháng", "Lãi/tháng", "Dư nợ cuối năm"],
      rows: result.rows.filter((r) => r.month % 12 === 0).map((r) => [String(r.month / 12), compactVnd(r.payment), compactVnd(r.interest), compactVnd(r.balance)]) },
    { heading: "Chi tiết từng tháng", head: ["Tháng", "Lãi suất", "Trả/tháng", "Lãi", "Gốc", "Dư nợ"],
      rows: result.rows.map((r) => [String(r.month), pct(r.rate), compactVnd(r.payment), compactVnd(r.interest), compactVnd(r.principal), compactVnd(r.balance)]) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-1.5">
          {RATE_PRESETS.map((p) => <button key={p.id} onClick={() => applyPreset(p.id)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">{p.label}</button>)}
        </div>
        <Field label="Số tiền vay" value={loan} onChange={setLoan} suffix="đ" hint={compactVnd(num(loan))} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kỳ hạn" value={years} onChange={setYears} suffix="năm" />
          <Field label="Lãi suất (sau ưu đãi)" value={rate} onChange={setRate} suffix="%/năm" />
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={usePromo} onChange={(e) => setUsePromo(e.target.checked)} />Có lãi suất ưu đãi</label>
        {usePromo && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lãi ưu đãi" value={promoRate} onChange={setPromoRate} suffix="%/năm" />
            <Field label="Số tháng ưu đãi" value={promoMonths} onChange={setPromoMonths} suffix="tháng" />
          </div>
        )}
        <div className="flex gap-2 text-sm">
          {(["reducing", "fixed_principal"] as AmortMethod[]).map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={`flex-1 rounded-lg border px-3 py-2 ${method === m ? "border-sky-500 bg-sky-500/10 text-sky-500" : "border-border"}`}>{m === "reducing" ? "Dư nợ giảm dần" : "Gốc cố định"}</button>
          ))}
        </div>
      </div>
      <ResultCard brand={brand} title="Trả góp khoản vay" subtitle={`${compactVnd(num(loan))} • ${num(years)} năm`} chart={chart} metrics={metrics} ex={ex} tables={tables} />
    </div>
  );
}

// ── Năng lực khách hàng (2 chế độ: Sale nội bộ ↔ Khách) ────────────────────────
const VERDICT_NEUTRAL: Record<Band, string> = { khoe: "Tốt", can_bien: "Cận biên", chua_du: "Cần thu xếp" };

function CustomerFitTab({ brand }: { brand: BrandInfo | null }) {
  const [mode, setMode] = useState<"sale" | "customer">("sale");
  const [advanced, setAdvanced] = useState(false);

  // hồ sơ khách
  const [incomes, setIncomes] = useState<IncomeLine[]>([{ label: "Lương", amount: 40_000_000, proven: true, variable: false }]);
  const [coIncome, setCoIncome] = useState("0");
  const [dependents, setDependents] = useState("0");
  const [livingOverride, setLivingOverride] = useState(""); // "" = tự ước theo người phụ thuộc
  const [debts, setDebts] = useState<DebtLine[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [age, setAge] = useState("35");
  const [down, setDown] = useState("30");
  const [target, setTarget] = useState(""); // giá căn nhắm (tùy chọn)

  // chính sách ngân hàng
  const [presetId, setPresetId] = useState(BANK_POLICIES[0].id);
  const [dsr, setDsr] = useState("60");
  const [ltv, setLtv] = useState("70");
  const [rate, setRate] = useState("11");
  const [maxAge, setMaxAge] = useState("70");
  const [termYears, setTermYears] = useState("20");

  const applyPolicy = (id: string) => {
    const p = BANK_POLICIES.find((x) => x.id === id); if (!p) return;
    setPresetId(id); setDsr(String(p.dsrCap)); setLtv(String(p.ltvCap));
    setRate(String(p.annualRate)); setMaxAge(String(p.maxAge)); setTermYears(String(Math.round(p.maxTermMonths / 12)));
  };

  // income line helpers
  const setIncome = (i: number, patch: Partial<IncomeLine>) => setIncomes((xs) => xs.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addIncome = () => setIncomes((xs) => [...xs, { label: "Nguồn khác", amount: 0, proven: true, variable: false }]);
  const delIncome = (i: number) => setIncomes((xs) => xs.filter((_, idx) => idx !== i));

  const policy: BankPolicy = {
    id: presetId, name: BANK_POLICIES.find((x) => x.id === presetId)?.name ?? "Tuỳ chỉnh",
    dsrCap: Number(dsr) || 0, ltvCap: Number(ltv) || 0, maxAge: num(maxAge) || 70,
    annualRate: Number(rate) || 0, maxTermMonths: (num(termYears) || 0) * 12,
  };
  const profile: CustomerProfile = {
    incomes, coBorrowerIncome: num(coIncome), dependents: num(dependents),
    livingCostOverride: livingOverride.trim() === "" ? null : num(livingOverride),
    debts, creditCards: cards, age: num(age) || 0, downPaymentPercent: Number(down) || 0,
  };
  const targetPrice = target.trim() === "" ? null : num(target);

  const pKey = JSON.stringify(profile);
  const polKey = JSON.stringify(policy);
  const result = useMemo(() => assessCustomer({ profile, policy, targetPrice }), [pKey, polKey, targetPrice]); // eslint-disable-line react-hooks/exhaustive-deps
  const scenarios = useMemo(
    () => [15, 20, 25].map((y) => ({ y, r: assessCustomer({ profile, policy: { ...policy, maxTermMonths: y * 12 }, targetPrice }) })),
    [pKey, polKey, targetPrice], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const dsrShown = result.target
    ? result.target.dsrAtTarget
    : result.qualifiedIncome > 0 ? ((result.existingObligations + result.maxMonthlyPayment) / result.qualifiedIncome) * 100 : 0;
  const payPct = result.target && result.qualifiedIncome > 0 ? (result.target.monthlyPayment / result.qualifiedIncome) * 100 : 0;

  const ex = mode === "sale" ? explainAssessSale(result) : explainAssessCustomer(result, null);

  const metrics: Metric[] = mode === "sale"
    ? [
        { label: "Vay tối đa", value: result.maxLoan, format: compactVnd },
        { label: "Mua tới giá", value: result.maxPropertyPrice, format: compactVnd },
        { label: result.target ? "Trả khoản căn này" : "Trả thêm/tháng", value: result.target ? result.target.monthlyPayment : result.maxMonthlyPayment, format: compactVnd },
        { label: result.target ? "DSR tại căn" : "DSR hiện tại", value: result.target ? result.target.dsrAtTarget : result.dsrCurrent, format: (n) => pct(n) },
      ]
    : result.target
      ? [
          { label: "Trả góp/tháng", value: result.target.monthlyPayment, format: compactVnd },
          { label: "% thu nhập", value: payPct, format: (n) => pct(n) },
          { label: "Vốn tự có cần", value: result.target.requiredDown, format: compactVnd },
          { label: "Vay ngân hàng", value: result.target.requiredLoan, format: compactVnd },
        ]
      : [
          { label: "Mua được tới", value: result.maxPropertyPrice, format: compactVnd },
          { label: "Trả góp/tháng", value: result.maxMonthlyPayment, format: compactVnd },
          { label: "Vay được", value: result.maxLoan, format: compactVnd },
          { label: "Vốn tự có", value: Number(down) || 0, format: (n) => pct(n) },
        ];

  const obBars: BarItem[] = [
    { label: "Thu nhập tính được", value: result.qualifiedIncome, display: compactVnd(result.qualifiedIncome), color: "#34d399" },
    { label: "Chi phí sống", value: result.livingCost, display: compactVnd(result.livingCost), color: "#94a3b8" },
    { label: "Nợ hiện có", value: result.existingObligations, display: compactVnd(result.existingObligations), color: "#f0883e" },
    { label: result.target ? "Khoản vay căn này" : "Khả năng trả thêm", value: result.target ? result.target.monthlyPayment : result.maxMonthlyPayment, display: compactVnd(result.target ? result.target.monthlyPayment : result.maxMonthlyPayment), color: "#38bdf8" },
  ];
  const affordBars: BarItem[] = result.target
    ? [
        { label: "Vay cần", value: result.target.requiredLoan, display: compactVnd(result.target.requiredLoan), color: result.target.affordable ? "#34d399" : "#f87171" },
        { label: "Vay được (tối đa)", value: result.maxLoan, display: compactVnd(result.maxLoan), color: "#38bdf8" },
      ]
    : [];

  const chart = (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="w-full max-w-[260px]"><Gauge percent={dsrShown} label={`DSR ${result.target ? "tại căn" : "khi vay tối đa"}`} /></div>
      <div className="text-[10px] text-slate-400">Xanh: thoải mái · Vàng: cận biên · Đỏ: căng (vượt trần {pct(policy.dsrCap)})</div>
      <div className="w-full px-1"><MiniBars items={obBars} /></div>
      {affordBars.length > 0 && (
        <div className="w-full px-1">
          <div className="mb-1 text-[11px] text-slate-300">Vay cần vs. vay được</div>
          <MiniBars items={affordBars} />
        </div>
      )}
    </div>
  );

  const tables: ReportTable[] = [
    {
      heading: "So sánh kịch bản kỳ hạn",
      head: ["Kỳ hạn", "Trả/tháng", "Vay tối đa", "Mua tới giá", "Đánh giá"],
      rows: scenarios.map(({ y, r }) => [
        `${y} năm`,
        compactVnd(r.target ? r.target.monthlyPayment : r.maxMonthlyPayment),
        compactVnd(r.maxLoan), compactVnd(r.maxPropertyPrice), VERDICT_NEUTRAL[r.verdict],
      ]),
    },
  ];

  const title = mode === "sale" ? "Đánh giá năng lực khách" : ex.title;
  const subtitle = result.target ? `Căn nhắm ${compactVnd(result.target.price)} • ${policy.name}` : `Thu nhập ${compactVnd(result.qualifiedIncome)}/tháng`;

  return (
    <div className="flex flex-col gap-4">
      {/* chế độ + mức nhập */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg border border-border p-0.5 text-sm">
          {(["sale", "customer"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-md px-3 py-1.5 transition ${mode === m ? "bg-sky-500 text-white" : "text-muted-foreground hover:bg-muted"}`}>
              {m === "sale" ? "🕵️ Bản sale" : "🏡 Bản gửi khách"}
            </button>
          ))}
        </div>
        <button onClick={() => setAdvanced((a) => !a)} className="text-sm text-sky-500 hover:underline">{advanced ? "− Thu gọn" : "+ Nâng cao"}</button>
      </div>
      {mode === "sale"
        ? <p className="-mt-2 text-xs text-amber-500/90">Bản đánh giá nội bộ — dùng để lọc &amp; lái sản phẩm, không đưa khách xem.</p>
        : <p className="-mt-2 text-xs text-emerald-500/90">Bản tích cực để gửi khách — luôn nêu lộ trình sở hữu, kèm miễn trừ &amp; lưu ý CIC.</p>}

      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        {/* preset ngân hàng */}
        <div className="flex flex-wrap gap-1.5">
          {BANK_POLICIES.map((p) => (
            <button key={p.id} onClick={() => applyPolicy(p.id)} className={`rounded-full border px-3 py-1 text-xs ${presetId === p.id ? "border-sky-500 bg-sky-500/10 text-sky-500" : "border-border hover:bg-muted"}`}>{p.name}</button>
          ))}
        </div>

        {/* thu nhập */}
        {!advanced ? (
          <Field label="Thu nhập/tháng (chứng minh được)" value={String(incomes[0]?.amount ?? 0)} onChange={(v) => setIncome(0, { amount: num(v) })} suffix="đ" hint={compactVnd(incomes[0]?.amount ?? 0)} />
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Các nguồn thu nhập</span>
            {incomes.map((it, i) => (
              <div key={i} className="flex flex-col gap-1.5 rounded-lg border border-border p-2">
                <div className="flex items-center gap-2">
                  <input value={it.label} onChange={(e) => setIncome(i, { label: e.target.value })} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-sky-500" />
                  <input inputMode="numeric" value={String(it.amount)} onChange={(e) => setIncome(i, { amount: num(e.target.value) })} className="w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm outline-none focus:border-sky-500" />
                  <span className="text-xs text-muted-foreground">đ</span>
                  {incomes.length > 1 && <button onClick={() => delIncome(i)} className="text-muted-foreground hover:text-red-500" aria-label="Xoá">✕</button>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <label className="flex items-center gap-1"><input type="checkbox" checked={it.proven} onChange={(e) => setIncome(i, { proven: e.target.checked })} />Chứng minh được</label>
                  <label className="flex items-center gap-1"><input type="checkbox" checked={it.variable} onChange={(e) => setIncome(i, { variable: e.target.checked })} />Biến động (×70%)</label>
                </div>
              </div>
            ))}
            <button onClick={addIncome} className="self-start text-sm text-sky-500 hover:underline">+ Thêm nguồn</button>
            <Field label="Thu nhập người đồng vay/tháng" value={coIncome} onChange={setCoIncome} suffix="đ" hint={compactVnd(num(coIncome))} />
          </div>
        )}

        {/* nợ — nhanh: tổng; nâng cao: liệt kê + thẻ */}
        {!advanced ? (
          <Field label="Đang trả nợ/tháng" value={String(debts[0]?.monthly ?? 0)} onChange={(v) => setDebts(num(v) > 0 ? [{ label: "Nợ hiện tại", monthly: num(v) }] : [])} suffix="đ" hint={compactVnd(debts[0]?.monthly ?? 0)} />
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Khoản nợ đang trả</span>
            {debts.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={d.label} onChange={(e) => setDebts((xs) => xs.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-sky-500" />
                <input inputMode="numeric" value={String(d.monthly)} onChange={(e) => setDebts((xs) => xs.map((x, idx) => idx === i ? { ...x, monthly: num(e.target.value) } : x))} className="w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm outline-none focus:border-sky-500" />
                <span className="text-xs text-muted-foreground">đ/th</span>
                <button onClick={() => setDebts((xs) => xs.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500" aria-label="Xoá">✕</button>
              </div>
            ))}
            <button onClick={() => setDebts((xs) => [...xs, { label: "Khoản nợ", monthly: 0 }])} className="self-start text-sm text-sky-500 hover:underline">+ Thêm khoản nợ</button>
            <span className="mt-1 text-sm text-muted-foreground">Thẻ tín dụng (tính 5% hạn mức/tháng)</span>
            {cards.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input value={c.label} onChange={(e) => setCards((xs) => xs.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-sky-500" />
                <input inputMode="numeric" value={String(c.limit)} onChange={(e) => setCards((xs) => xs.map((x, idx) => idx === i ? { ...x, limit: num(e.target.value) } : x))} className="w-32 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm outline-none focus:border-sky-500" />
                <span className="text-xs text-muted-foreground">hạn mức</span>
                <button onClick={() => setCards((xs) => xs.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500" aria-label="Xoá">✕</button>
              </div>
            ))}
            <button onClick={() => setCards((xs) => [...xs, { label: "Thẻ tín dụng", limit: 0 }])} className="self-start text-sm text-sky-500 hover:underline">+ Thêm thẻ</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Tuổi người vay" value={age} onChange={setAge} suffix="tuổi" hint={`Kỳ hạn ≤ ${Math.max(0, (num(maxAge) || 70) - (num(age) || 0))} năm`} />
          <Field label="Vốn tự có" value={down} onChange={setDown} suffix="%" />
        </div>
        <Field label="Giá căn đang nhắm (tùy chọn)" value={target} onChange={setTarget} suffix="đ" hint={targetPrice ? compactVnd(targetPrice) : "Để trống = chỉ tính khả năng tối đa"} />

        {advanced && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Số người phụ thuộc" value={dependents} onChange={setDependents} suffix="người" hint={`Chi phí sống ≈ ${compactVnd(result.livingCost)}`} />
              <Field label="Chi phí sống/tháng (ghi đè)" value={livingOverride} onChange={setLivingOverride} suffix="đ" hint="Để trống = tự ước" />
            </div>
            <div className="rounded-lg border border-border/60 p-3">
              <div className="mb-2 text-xs font-medium text-muted-foreground">Chính sách ngân hàng</div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Trần DSR" value={dsr} onChange={setDsr} suffix="%" />
                <Field label="Trần LTV" value={ltv} onChange={setLtv} suffix="%" />
                <Field label="Lãi suất" value={rate} onChange={setRate} suffix="%/năm" />
                <Field label="Kỳ hạn" value={termYears} onChange={setTermYears} suffix="năm" />
                <Field label="Tuổi tối đa" value={maxAge} onChange={setMaxAge} suffix="tuổi" />
              </div>
            </div>
          </>
        )}
      </div>

      <ResultCard brand={brand} title={title} subtitle={subtitle} chart={chart} metrics={metrics} ex={ex} tables={tables} />

      {/* so sánh kịch bản — trên màn hình */}
      <div className="rounded-xl border border-border p-4">
        <div className="mb-2 text-sm font-semibold">So sánh kịch bản kỳ hạn</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 pr-2">Kỳ hạn</th><th className="py-1 pr-2 text-right">Trả/tháng</th><th className="py-1 pr-2 text-right">Vay tối đa</th><th className="py-1 pr-2 text-right">Mua tới giá</th><th className="py-1 text-right">Đánh giá</th>
            </tr></thead>
            <tbody>
              {scenarios.map(({ y, r }) => (
                <tr key={y} className="border-t border-border/60">
                  <td className="py-1.5 pr-2">{y} năm</td>
                  <td className="py-1.5 pr-2 text-right">{compactVnd(r.target ? r.target.monthlyPayment : r.maxMonthlyPayment)}</td>
                  <td className="py-1.5 pr-2 text-right">{compactVnd(r.maxLoan)}</td>
                  <td className="py-1.5 pr-2 text-right">{compactVnd(r.maxPropertyPrice)}</td>
                  <td className={`py-1.5 text-right font-medium ${r.verdict === "khoe" ? "text-emerald-500" : r.verdict === "can_bien" ? "text-amber-500" : "text-red-500"}`}>{VERDICT_NEUTRAL[r.verdict]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">Kỳ hạn thực tế bị giới hạn bởi tuổi (tuổi + kỳ hạn ≤ {num(maxAge) || 70}).</p>
      </div>
    </div>
  );
}

// ── Lịch thanh toán ────────────────────────────────────────────────────────────
function ScheduleTab({ brand }: { brand: BrandInfo | null }) {
  const [price, setPrice] = useState("3000000000");
  const [rows, setRows] = useState<Installment[]>(SCHEDULE_PRESETS[0].installments);

  const applyPreset = (id: string) => { const p = SCHEDULE_PRESETS.find((x) => x.id === id); if (p) setRows(p.installments.map((r) => ({ ...r }))); };
  const update = (i: number, patch: Partial<Installment>) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { label: "Đợt mới", percent: 0 }]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const result = useMemo(() => schedule({ price: num(price), installments: rows }), [price, rows]);
  const ex = explainSchedule({ price: num(price), installments: rows }, result);
  const heaviest = result.rows.reduce((a, b) => (b.amount > a.amount ? b : a), result.rows[0] ?? { amount: 0, label: "", percent: 0, cumulative: 0, remaining: 0, due: null });

  const metrics: Metric[] = [
    { label: "Giá BĐS", value: num(price), format: compactVnd },
    { label: "Số đợt", value: result.rows.length, format: (n) => String(Math.round(n)) },
    { label: "Đợt nặng nhất", value: heaviest.amount, format: compactVnd },
    { label: "Tổng %", value: result.totalPercent, format: (n) => pct(n) },
  ];
  const bars: BarItem[] = result.rows.map((r) => ({ label: `${r.label} (${pct(r.percent)})`, value: r.amount, display: compactVnd(r.amount), color: "#38bdf8" }));
  const chart = <div className="w-full px-1"><MiniBars items={bars} /></div>;
  const tables: ReportTable[] = [
    { heading: "Lịch thanh toán theo tiến độ", head: ["Đợt", "%", "Số tiền", "Luỹ kế", "Còn lại", "Mốc"],
      rows: result.rows.map((r) => [r.label, String(r.percent), compactVnd(r.amount), compactVnd(r.cumulative), compactVnd(r.remaining), r.due ?? ""]) },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-1.5">
          {SCHEDULE_PRESETS.map((p) => <button key={p.id} onClick={() => applyPreset(p.id)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">{p.label}</button>)}
        </div>
        <Field label="Giá BĐS" value={price} onChange={setPrice} suffix="đ" hint={compactVnd(num(price))} />
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={r.label} onChange={(e) => update(i, { label: e.target.value })} className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-sky-500" />
              <input inputMode="numeric" value={String(r.percent)} onChange={(e) => update(i, { percent: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })} className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm outline-none focus:border-sky-500" />
              <span className="text-xs text-muted-foreground">%</span>
              <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-red-500" aria-label="Xoá đợt">✕</button>
            </div>
          ))}
          <button onClick={addRow} className="self-start text-sm text-sky-500 hover:underline">+ Thêm đợt</button>
        </div>
        <p className={`text-sm ${result.balanced ? "text-emerald-500" : "text-amber-500"}`}>Tổng: {pct(result.totalPercent)} {result.balanced ? "✓" : "(cần đủ 100%)"}</p>
      </div>
      <ResultCard brand={brand} title="Lịch thanh toán" subtitle={`Giá ${compactVnd(num(price))}`} chart={chart} metrics={metrics} ex={ex} tables={tables} />
    </div>
  );
}

// ── Cho thuê ───────────────────────────────────────────────────────────────────
function RentalTab({ brand }: { brand: BrandInfo | null }) {
  const [price, setPrice] = useState("3000000000");
  const [rent, setRent] = useState("12000000");
  const [occ, setOcc] = useState("90");
  const [costs, setCosts] = useState("1000000");
  const [loanPay, setLoanPay] = useState("18000000");

  const input = { price: num(price), monthlyLoanPayment: num(loanPay), monthlyRent: num(rent), occupancyPercent: Number(occ) || 0, monthlyCosts: num(costs) };
  const result = useMemo(() => rental(input), [price, rent, occ, costs, loanPay]); // eslint-disable-line react-hooks/exhaustive-deps
  const ex = explainRental(input, result);

  const metrics: Metric[] = [
    { label: "Thực nhận/tháng", value: result.effectiveRent, format: compactVnd },
    { label: "Dòng tiền ròng", value: result.monthlyNet, format: compactVnd, color: result.positive ? "#34d399" : "#f87171" },
    { label: "Dòng tiền/năm", value: result.annualNet, format: compactVnd },
    { label: "Suất thuê gộp", value: result.grossYieldPercent, format: (n) => pct(n) },
  ];
  const bars: BarItem[] = [
    { label: "Thuê thực nhận", value: result.effectiveRent, display: compactVnd(result.effectiveRent), color: "#34d399" },
    { label: "Trả nợ vay", value: input.monthlyLoanPayment, display: compactVnd(input.monthlyLoanPayment), color: "#f0883e" },
    { label: "Chi phí", value: input.monthlyCosts, display: compactVnd(input.monthlyCosts), color: "#94a3b8" },
  ];
  const chart = (
    <div className="flex w-full flex-col items-center gap-2">
      <div className={`rounded-xl px-4 py-2 text-center ${result.positive ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
        <div className="text-[11px]">Dòng tiền ròng/tháng</div>
        <CountUp value={result.monthlyNet} format={compactVnd} className="text-2xl font-extrabold" />
        <div className="text-[11px]">{result.positive ? "Dương — tự nuôi được" : "Âm — phải bù mỗi tháng"}</div>
      </div>
      <div className="w-full px-1"><MiniBars items={bars} /></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <Field label="Giá mua" value={price} onChange={setPrice} suffix="đ" hint={compactVnd(num(price))} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Giá thuê/tháng" value={rent} onChange={setRent} suffix="đ" hint={compactVnd(num(rent))} />
          <Field label="Tỉ lệ lấp đầy" value={occ} onChange={setOcc} suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trả nợ vay/tháng" value={loanPay} onChange={setLoanPay} suffix="đ" hint={compactVnd(num(loanPay))} />
          <Field label="Chi phí/tháng" value={costs} onChange={setCosts} suffix="đ" hint={compactVnd(num(costs))} />
        </div>
      </div>
      <ResultCard brand={brand} title="Dòng tiền cho thuê" subtitle={`Thuê ${compactVnd(num(rent))}/tháng`} chart={chart} metrics={metrics} ex={ex} tables={[]} />
    </div>
  );
}
