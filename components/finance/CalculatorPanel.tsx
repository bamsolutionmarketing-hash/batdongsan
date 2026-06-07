"use client";

import { useMemo, useState } from "react";
import { amortize, affordability, schedule, rental } from "@/lib/finance/calc";
import { explainAmort, explainAfford, explainSchedule, explainRental, type Explained } from "@/lib/finance/explain";
import { compactVnd, vnd, pct } from "@/lib/finance/format";
import { DISCLAIMER } from "@/lib/finance/disclaimer";
import { RATE_PRESETS, SCHEDULE_PRESETS } from "@/lib/finance/presets";
import type { AmortMethod, Installment, ReportPayload } from "@/lib/finance/types";
import type { FinanceCard, CardRow } from "@/lib/finance/card";
import { financeCardAction, financeReportAction } from "@/app/(app)/calculator/_actions";

type Tab = "loan" | "afford" | "schedule" | "rental";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "loan", label: "Trả góp", icon: "🏦" },
  { id: "afford", label: "Khả năng vay", icon: "💪" },
  { id: "schedule", label: "Lịch tiến độ", icon: "📅" },
  { id: "rental", label: "Cho thuê", icon: "🔑" },
];

// digits only → number
const num = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

export function CalculatorPanel() {
  const [tab, setTab] = useState<Tab>("loan");
  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-1 flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition ${
              tab === t.id ? "bg-sky-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "loan" && <LoanTab />}
      {tab === "afford" && <AffordTab />}
      {tab === "schedule" && <ScheduleTab />}
      {tab === "rental" && <RentalTab />}
    </div>
  );
}

// ── shared bits ───────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  hint,
  suffix,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-sky-500">
        <input
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none"
        />
        {suffix && <span className="shrink-0 text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <span className="text-xs text-sky-500/90">{hint}</span>}
    </label>
  );
}

function ResultCard({
  ex,
  table,
  card,
  report,
}: {
  ex: Explained;
  table?: React.ReactNode;
  card: FinanceCard;
  report: ReportPayload;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
      <h2 className="font-semibold">{ex.title}</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {ex.lines.map((l, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-sky-500">›</span>
            <span>{l}</span>
          </li>
        ))}
      </ul>
      {table}
      <ShareRow copyText={ex.copyText} card={card} report={report} />
      <p className="text-[11px] leading-snug text-muted-foreground">{DISCLAIMER}</p>
    </section>
  );
}

function ShareRow({ copyText, card, report }: { copyText: string; card: FinanceCard; report: ReportPayload }) {
  const [copied, setCopied] = useState(false);
  const [img, setImg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setErr("Không copy được — chọn và copy thủ công.");
    }
  };

  const makeImage = async () => {
    setBusy(true);
    setErr(null);
    const res = await financeCardAction(card);
    setBusy(false);
    if (res.ok && res.dataUrl) setImg(res.dataUrl);
    else setErr(res.error ?? "Tạo ảnh thất bại.");
  };

  const makePdf = async () => {
    setPdfBusy(true);
    setErr(null);
    const res = await financeReportAction(report);
    setPdfBusy(false);
    if (res.ok && res.dataUrl) {
      const a = document.createElement("a");
      a.href = res.dataUrl;
      a.download = "bao-cao-tai-chinh.pdf";
      a.click();
    } else setErr(res.error ?? "Tạo PDF thất bại.");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={copy}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
        >
          {copied ? "✓ Đã copy" : "📋 Copy text"}
        </button>
        <button
          onClick={makeImage}
          disabled={busy}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-60"
        >
          {busy ? "Đang tạo…" : "🖼️ Tạo ảnh"}
        </button>
        <button
          onClick={makePdf}
          disabled={pdfBusy}
          className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white hover:bg-sky-600 disabled:opacity-60"
        >
          {pdfBusy ? "Đang tạo…" : "📄 Xuất PDF cho khách"}
        </button>
      </div>
      {err && <p className="text-xs text-amber-500">{err}</p>}
      {img && (
        <div className="flex flex-col items-start gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img} alt="Ảnh dự tính tài chính" className="w-full max-w-xs rounded-lg border border-border" />
          <a
            href={img}
            download="du-tinh-tai-chinh.png"
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
          >
            ⬇️ Tải ảnh
          </a>
        </div>
      )}
    </div>
  );
}

const cardRows = (rows: CardRow[]) => rows;

// ── Trả góp ──────────────────────────────────────────────────────────────────
function LoanTab() {
  const [loan, setLoan] = useState("2000000000");
  const [years, setYears] = useState("20");
  const [rate, setRate] = useState("11");
  const [method, setMethod] = useState<AmortMethod>("reducing");
  const [usePromo, setUsePromo] = useState(true);
  const [promoRate, setPromoRate] = useState("7.5");
  const [promoMonths, setPromoMonths] = useState("12");

  const applyPreset = (id: string) => {
    const p = RATE_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setMethod(p.method);
    setRate(String(p.floatingRate));
    setUsePromo(p.promoMonths > 0);
    setPromoRate(String(p.promoRate));
    setPromoMonths(String(p.promoMonths));
  };

  const result = useMemo(
    () =>
      amortize({
        loanAmount: num(loan),
        annualRate: Number(rate) || 0,
        termMonths: (num(years) || 0) * 12,
        method,
        promoRate: usePromo ? Number(promoRate) || 0 : null,
        promoMonths: usePromo ? num(promoMonths) : null,
      }),
    [loan, rate, years, method, usePromo, promoRate, promoMonths],
  );

  const ex = explainAmort(
    {
      loanAmount: num(loan),
      annualRate: Number(rate) || 0,
      termMonths: (num(years) || 0) * 12,
      method,
      promoRate: usePromo ? Number(promoRate) || 0 : null,
      promoMonths: usePromo ? num(promoMonths) : null,
    },
    result,
  );

  const card: FinanceCard = {
    title: "Trả góp khoản vay",
    subtitle: `${compactVnd(num(loan))} • ${num(years)} năm`,
    rows: cardRows([
      { label: "Vay", value: vnd(num(loan)) },
      usePromo
        ? { label: `Ưu đãi ${pct(Number(promoRate) || 0)} (${num(promoMonths)} th)`, value: `${vnd(result.promoMonthlyPayment ?? result.firstPayment)}/th` }
        : { label: `Lãi ${pct(Number(rate) || 0)}/năm`, value: `${vnd(result.firstPayment)}/th` },
      result.postPromoFirstPayment != null
        ? { label: "Sau ưu đãi", value: `${vnd(result.postPromoFirstPayment)}/th` }
        : { label: "Trả cao nhất", value: `${vnd(result.maxPayment)}/th` },
      { label: "Tổng lãi", value: vnd(result.totalInterest) },
      { label: "Tổng phải trả", value: vnd(result.totalPaid) },
    ]),
  };

  // Yearly snapshot (dư nợ + trả/tháng cuối mỗi năm) — compact for mobile.
  const yearly = result.rows.filter((r) => r.month % 12 === 0).slice(0, 6);

  const report: ReportPayload = {
    title: ex.title,
    subtitle: card.subtitle,
    bullets: ex.lines,
    summary: card.rows,
    tables: [
      {
        heading: "Tổng quan theo năm",
        head: ["Năm", "Trả/tháng", "Lãi/tháng", "Dư nợ cuối năm"],
        rows: result.rows
          .filter((r) => r.month % 12 === 0)
          .map((r) => [String(r.month / 12), compactVnd(r.payment), compactVnd(r.interest), compactVnd(r.balance)]),
      },
      {
        heading: "Chi tiết từng tháng",
        head: ["Tháng", "Lãi suất", "Trả/tháng", "Lãi", "Gốc", "Dư nợ"],
        rows: result.rows.map((r) => [
          String(r.month),
          pct(r.rate),
          compactVnd(r.payment),
          compactVnd(r.interest),
          compactVnd(r.principal),
          compactVnd(r.balance),
        ]),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-1.5">
          {RATE_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
            >
              {p.label}
            </button>
          ))}
        </div>
        <Field label="Số tiền vay" value={loan} onChange={setLoan} suffix="đ" hint={compactVnd(num(loan))} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kỳ hạn" value={years} onChange={setYears} suffix="năm" />
          <Field label="Lãi suất (sau ưu đãi)" value={rate} onChange={setRate} suffix="%/năm" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={usePromo} onChange={(e) => setUsePromo(e.target.checked)} />
          Có lãi suất ưu đãi
        </label>
        {usePromo && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Lãi ưu đãi" value={promoRate} onChange={setPromoRate} suffix="%/năm" />
            <Field label="Số tháng ưu đãi" value={promoMonths} onChange={setPromoMonths} suffix="tháng" />
          </div>
        )}
        <div className="flex gap-2 text-sm">
          {(["reducing", "fixed_principal"] as AmortMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`flex-1 rounded-lg border px-3 py-2 ${
                method === m ? "border-sky-500 bg-sky-500/10 text-sky-500" : "border-border"
              }`}
            >
              {m === "reducing" ? "Dư nợ giảm dần" : "Gốc cố định"}
            </button>
          ))}
        </div>
      </div>

      <ResultCard
        ex={ex}
        card={card}
        report={report}
        table={
          yearly.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1 pr-2">Năm</th>
                    <th className="py-1 pr-2">Trả/tháng</th>
                    <th className="py-1">Dư nợ cuối năm</th>
                  </tr>
                </thead>
                <tbody>
                  {yearly.map((r) => (
                    <tr key={r.month} className="border-t border-border">
                      <td className="py-1 pr-2">{r.month / 12}</td>
                      <td className="py-1 pr-2">{compactVnd(r.payment)}</td>
                      <td className="py-1">{compactVnd(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null
        }
      />
    </div>
  );
}

// ── Khả năng vay ──────────────────────────────────────────────────────────────
function AffordTab() {
  const [income, setIncome] = useState("40000000");
  const [debt, setDebt] = useState("0");
  const [dti, setDti] = useState("50");
  const [rate, setRate] = useState("11");
  const [years, setYears] = useState("20");
  const [down, setDown] = useState("30");

  const input = {
    monthlyIncome: num(income),
    existingDebt: num(debt),
    dtiPercent: Number(dti) || 0,
    annualRate: Number(rate) || 0,
    termMonths: (num(years) || 0) * 12,
    downPaymentPercent: Number(down) || 0,
  };
  const result = useMemo(() => affordability(input), [income, debt, dti, rate, years, down]); // eslint-disable-line react-hooks/exhaustive-deps
  const ex = explainAfford(input, result);

  const card: FinanceCard = {
    title: "Khả năng tài chính",
    subtitle: `Thu nhập ${compactVnd(num(income))}/tháng`,
    rows: cardRows([
      { label: "Trả nợ tối đa thêm", value: `${vnd(result.maxMonthlyPayment)}/th` },
      { label: "Vay tối đa", value: vnd(result.maxLoan) },
      { label: "Mua được giá tối đa", value: vnd(result.maxPropertyPrice) },
      { label: `Vốn tự có (${pct(input.downPaymentPercent)})`, value: vnd(result.requiredDownPayment) },
    ]),
  };

  const report: ReportPayload = { title: ex.title, subtitle: card.subtitle, bullets: ex.lines, summary: card.rows, tables: [] };

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
      <ResultCard ex={ex} card={card} report={report} />
    </div>
  );
}

// ── Lịch thanh toán theo tiến độ ─────────────────────────────────────────────
function ScheduleTab() {
  const [price, setPrice] = useState("3000000000");
  const [rows, setRows] = useState<Installment[]>(SCHEDULE_PRESETS[0].installments);

  const applyPreset = (id: string) => {
    const p = SCHEDULE_PRESETS.find((x) => x.id === id);
    if (p) setRows(p.installments.map((r) => ({ ...r })));
  };
  const update = (i: number, patch: Partial<Installment>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => setRows((rs) => [...rs, { label: "Đợt mới", percent: 0 }]);
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const result = useMemo(() => schedule({ price: num(price), installments: rows }), [price, rows]);
  const ex = explainSchedule({ price: num(price), installments: rows }, result);

  const card: FinanceCard = {
    title: "Lịch thanh toán",
    subtitle: `Giá ${compactVnd(num(price))}`,
    rows: cardRows(result.rows.slice(0, 6).map((r) => ({ label: `${r.label} (${pct(r.percent)})`, value: vnd(r.amount) }))),
  };

  const report: ReportPayload = {
    title: ex.title,
    subtitle: card.subtitle,
    bullets: ex.lines,
    summary: card.rows,
    tables: [
      {
        heading: "Lịch thanh toán theo tiến độ",
        head: ["Đợt", "%", "Số tiền", "Luỹ kế", "Còn lại", "Mốc"],
        rows: result.rows.map((r) => [
          r.label,
          String(r.percent),
          compactVnd(r.amount),
          compactVnd(r.cumulative),
          compactVnd(r.remaining),
          r.due ?? "",
        ]),
      },
    ],
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
        <div className="flex flex-wrap gap-1.5">
          {SCHEDULE_PRESETS.map((p) => (
            <button key={p.id} onClick={() => applyPreset(p.id)} className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted">
              {p.label}
            </button>
          ))}
        </div>
        <Field label="Giá BĐS" value={price} onChange={setPrice} suffix="đ" hint={compactVnd(num(price))} />
        <div className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={r.label}
                onChange={(e) => update(i, { label: e.target.value })}
                className="min-w-0 flex-1 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-sky-500"
              />
              <input
                inputMode="numeric"
                value={String(r.percent)}
                onChange={(e) => update(i, { percent: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 })}
                className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-right text-sm outline-none focus:border-sky-500"
              />
              <span className="text-xs text-muted-foreground">%</span>
              <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-red-500" aria-label="Xoá đợt">
                ✕
              </button>
            </div>
          ))}
          <button onClick={addRow} className="self-start text-sm text-sky-500 hover:underline">
            + Thêm đợt
          </button>
        </div>
        <p className={`text-sm ${result.balanced ? "text-emerald-500" : "text-amber-500"}`}>
          Tổng: {pct(result.totalPercent)} {result.balanced ? "✓" : "(cần đủ 100%)"}
        </p>
      </div>
      <ResultCard
        ex={ex}
        card={card}
        report={report}
        table={
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-1 pr-2">Đợt</th>
                  <th className="py-1 pr-2">%</th>
                  <th className="py-1 pr-2">Số tiền</th>
                  <th className="py-1">Còn lại</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-1 pr-2">{r.label}</td>
                    <td className="py-1 pr-2">{r.percent}</td>
                    <td className="py-1 pr-2">{compactVnd(r.amount)}</td>
                    <td className="py-1">{compactVnd(r.remaining)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />
    </div>
  );
}

// ── Dòng tiền cho thuê ───────────────────────────────────────────────────────
function RentalTab() {
  const [price, setPrice] = useState("3000000000");
  const [rent, setRent] = useState("12000000");
  const [occ, setOcc] = useState("90");
  const [costs, setCosts] = useState("1000000");
  const [loanPay, setLoanPay] = useState("18000000");

  const input = {
    price: num(price),
    monthlyLoanPayment: num(loanPay),
    monthlyRent: num(rent),
    occupancyPercent: Number(occ) || 0,
    monthlyCosts: num(costs),
  };
  const result = useMemo(() => rental(input), [price, rent, occ, costs, loanPay]); // eslint-disable-line react-hooks/exhaustive-deps
  const ex = explainRental(input, result);

  const card: FinanceCard = {
    title: "Dòng tiền cho thuê",
    subtitle: `Thuê ${compactVnd(num(rent))}/tháng`,
    rows: cardRows([
      { label: "Thực nhận (sau lấp đầy)", value: `${vnd(result.effectiveRent)}/th` },
      { label: "Trả nợ vay", value: `${vnd(num(loanPay))}/th` },
      { label: "Chi phí", value: `${vnd(num(costs))}/th` },
      { label: result.positive ? "Dòng tiền dương" : "Dòng tiền âm", value: `${vnd(result.monthlyNet)}/th` },
    ]),
  };

  const report: ReportPayload = { title: ex.title, subtitle: card.subtitle, bullets: ex.lines, summary: card.rows, tables: [] };

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
      <ResultCard ex={ex} card={card} report={report} />
    </div>
  );
}
