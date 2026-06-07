"use client";

import { useMemo, useRef, useState } from "react";
import { amortize, affordability, schedule, rental } from "@/lib/finance/calc";
import { explainAmort, explainAfford, explainSchedule, explainRental, type Explained } from "@/lib/finance/explain";
import { compactVnd, vnd, pct } from "@/lib/finance/format";
import { DISCLAIMER } from "@/lib/finance/disclaimer";
import { RATE_PRESETS, SCHEDULE_PRESETS } from "@/lib/finance/presets";
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
  { id: "afford", label: "Khả năng vay", icon: "💪" },
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
      {tab === "afford" && <AffordTab brand={brand} />}
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

// ── Khả năng vay ──────────────────────────────────────────────────────────────
function AffordTab({ brand }: { brand: BrandInfo | null }) {
  const [income, setIncome] = useState("40000000");
  const [debt, setDebt] = useState("0");
  const [dti, setDti] = useState("50");
  const [rate, setRate] = useState("11");
  const [years, setYears] = useState("20");
  const [down, setDown] = useState("30");

  const input = { monthlyIncome: num(income), existingDebt: num(debt), dtiPercent: Number(dti) || 0, annualRate: Number(rate) || 0, termMonths: (num(years) || 0) * 12, downPaymentPercent: Number(down) || 0 };
  const result = useMemo(() => affordability(input), [income, debt, dti, rate, years, down]); // eslint-disable-line react-hooks/exhaustive-deps
  const ex = explainAfford(input, result);

  // áp lực trả nợ thực tế / thu nhập (gồm nợ cũ + khoản mới)
  const pressure = input.monthlyIncome > 0 ? ((input.existingDebt + result.maxMonthlyPayment) / input.monthlyIncome) * 100 : 0;
  const metrics: Metric[] = [
    { label: "Vay tối đa", value: result.maxLoan, format: compactVnd },
    { label: "Mua được giá tối đa", value: result.maxPropertyPrice, format: compactVnd },
    { label: "Trả nợ thêm/tháng", value: result.maxMonthlyPayment, format: compactVnd },
    { label: "Vốn tự có cần", value: result.requiredDownPayment, format: compactVnd },
  ];
  const chart = (
    <div className="flex w-full flex-col items-center">
      <div className="w-full max-w-[260px]"><Gauge percent={pressure} label="Trả nợ / thu nhập" /></div>
      <div className="text-[10px] text-slate-400">Xanh: an toàn (≤40%) · Vàng: cân nhắc · Đỏ: căng (&gt;55%)</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <Field label="Thu nhập/tháng" value={income} onChange={setIncome} suffix="đ" hint={compactVnd(num(income))} />
        <Field label="Đang trả nợ/tháng" value={debt} onChange={setDebt} suffix="đ" hint={compactVnd(num(debt))} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tỉ lệ trả nợ tối đa" value={dti} onChange={setDti} suffix="%" hint="NH thường 50–70%" />
          <Field label="Vốn tự có" value={down} onChange={setDown} suffix="%" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lãi suất dự kiến" value={rate} onChange={setRate} suffix="%/năm" />
          <Field label="Kỳ hạn" value={years} onChange={setYears} suffix="năm" />
        </div>
      </div>
      <ResultCard brand={brand} title="Khả năng vay & ngân sách" subtitle={`Thu nhập ${compactVnd(num(income))}/tháng`} chart={chart} metrics={metrics} ex={ex} tables={[]} />
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
