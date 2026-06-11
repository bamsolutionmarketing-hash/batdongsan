"use client";

import { useState } from "react";
import type { Customer } from "@/lib/repo/customer-types";
import { STATUS_LABEL } from "@/lib/repo/customer-types";

const fmtTr = (n: number | null | undefined) => (n == null ? "—" : `${Math.round(n / 1_000_000)}tr`);
const TIER_LABEL: Record<string, string> = { nong: "🔥 Nóng", am: "🌤️ Ấm", nguoi: "❄️ Nguội" };

// Đặt 2–3 khách cạnh nhau khi sale đang chào cùng một căn cho nhiều người —
// so điểm tiềm năng, thu nhập, vay tối đa, mua tới giá để biết ưu tiên ai.
export function CompareCustomers({ customers }: { customers: Customer[] }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  if (customers.length < 2) return null;

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));
  const chosen = customers.filter((c) => picked.includes(c.id));

  const rows: { label: string; get: (c: Customer) => string }[] = [
    { label: "Tiềm năng", get: (c) => (c.leadScore != null ? `${c.leadScore}/100` : "—") },
    { label: "Hạng", get: (c) => (c.leadTier ? TIER_LABEL[c.leadTier] : "—") },
    { label: "Thu nhập ước", get: (c) => (c.incomeLow != null && c.incomeHigh != null ? `${fmtTr(c.incomeLow)}–${fmtTr(c.incomeHigh)}` : "—") },
    { label: "Vay tối đa", get: (c) => fmtTr((c.assessment as { maxLoan?: number } | null)?.maxLoan) },
    { label: "Mua tới giá", get: (c) => fmtTr((c.assessment as { maxPropertyPrice?: number } | null)?.maxPropertyPrice) },
    { label: "Trạng thái", get: (c) => STATUS_LABEL[c.status] },
  ];

  return (
    <section className="rounded-xl border border-border">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold">
        <span>⚖️ So sánh khách {picked.length > 0 ? `(${picked.length})` : ""}</span>
        <span className="text-muted-foreground">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-border p-3">
          <p className="text-xs text-muted-foreground">Chọn 2–3 khách để đặt cạnh nhau (đang chào cùng một căn).</p>
          <div className="flex flex-wrap gap-1.5">
            {customers.map((c) => (
              <button key={c.id} onClick={() => toggle(c.id)} disabled={!picked.includes(c.id) && picked.length >= 3}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  picked.includes(c.id) ? "border-sky-500 bg-sky-500/10 text-sky-500" : "border-border hover:bg-muted disabled:opacity-40"
                }`}>
                {c.name}
              </button>
            ))}
          </div>

          {chosen.length >= 2 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="py-1 pr-2"></th>
                    {chosen.map((c) => <th key={c.id} className="py-1 pr-2 font-semibold text-foreground">{c.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="border-t border-border/60">
                      <td className="py-1.5 pr-2 text-xs text-muted-foreground">{r.label}</td>
                      {chosen.map((c) => <td key={c.id} className="py-1.5 pr-2 tabular-nums">{r.get(c)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
