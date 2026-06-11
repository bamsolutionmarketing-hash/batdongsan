import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listCustomers, STATUS_LABEL, type Customer, type CustomerStatus } from "@/lib/repo/customers";
import type { Tier } from "@/lib/finance/lead";
import { createCustomer, updateCustomer, deleteCustomer } from "./_actions";
import { CompareCustomers } from "./CompareCustomers";
import { Notice } from "@/app/(admin)/admin/_Notice";
import { Button } from "@/components/ui/button";

const input = "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";

const TIER_META: Record<Tier, { label: string; cls: string }> = {
  nong: { label: "🔥 Nóng", cls: "bg-emerald-500/15 text-emerald-500" },
  am: { label: "🌤️ Ấm", cls: "bg-amber-500/15 text-amber-500" },
  nguoi: { label: "❄️ Nguội", cls: "bg-slate-500/15 text-slate-400" },
};
const fmtTr = (n: number) => `${Math.round(n / 1_000_000)}tr`;

export default async function CustomersPage({ searchParams }: {
  searchParams: { error?: string; ok?: string; tier?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const res = await listCustomers(session.userId);
  const all = res.ok ? res.data : [];

  const today = new Date().toISOString().slice(0, 10);
  const due = all.filter((c) => c.nextFollowupAt && c.nextFollowupAt <= today && c.status !== "da_chot" && c.status !== "ngung");
  const tierFilter = (["nong", "am", "nguoi"] as const).find((t) => t === searchParams.tier) ?? null;
  const list = tierFilter ? all.filter((c) => c.leadTier === tierFilter) : all;
  const countBy = (t: Tier) => all.filter((c) => c.leadTier === t).length;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Khách hàng</h1>
        <span className="text-sm text-muted-foreground">{all.length} khách</span>
      </div>
      <Notice error={searchParams.error} ok={searchParams.ok} />

      {due.length > 0 && (
        <section className="rounded-xl border border-amber-700/50 bg-amber-950/20 p-3">
          <h2 className="text-sm font-semibold text-amber-300">⏰ Cần theo hôm nay ({due.length})</h2>
          <ul className="mt-2 flex flex-col gap-1.5">
            {due.map((c) => (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                {c.leadTier && <span className={`rounded-full px-2 py-0.5 text-xs ${TIER_META[c.leadTier].cls}`}>{TIER_META[c.leadTier].label}</span>}
                <span className="font-medium">{c.name}</span>
                {c.phone && <a href={`tel:${c.phone}`} className="ml-auto text-sky-400">📞 Gọi</a>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* thêm nhanh — đủ để "bắt" khách ngay trong cuộc gọi; đọc vị sâu thì làm
          ở tab Khám phá của máy tính tài chính rồi bấm Lưu khách */}
      <form action={createCustomer} className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-background p-3">
        <input name="name" placeholder="Tên khách *" className={`${input} min-w-32 flex-1`} required />
        <input name="phone" placeholder="SĐT" inputMode="tel" className={`${input} w-32`} />
        <input name="next_followup_at" type="date" title="Hẹn theo lại" className={input} />
        <Button type="submit">+ Thêm</Button>
      </form>

      <div className="flex flex-wrap gap-1.5 text-sm">
        <Link href="/customers" className={`rounded-full border px-3 py-1 ${!tierFilter ? "border-sky-500 bg-sky-500/10 text-sky-500" : "border-border"}`}>Tất cả {all.length}</Link>
        {(["nong", "am", "nguoi"] as const).map((t) => (
          <Link key={t} href={`/customers?tier=${t}`} className={`rounded-full border px-3 py-1 ${tierFilter === t ? "border-sky-500 bg-sky-500/10 text-sky-500" : "border-border"}`}>
            {TIER_META[t].label} {countBy(t)}
          </Link>
        ))}
      </div>

      <CompareCustomers customers={all} />

      <ul className="flex flex-col gap-2">
        {list.map((c) => <CustomerCard key={c.id} c={c} />)}
        {list.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Chưa có khách nào{tierFilter ? " ở nhóm này" : ""}. Dùng tab <Link href="/calculator" className="text-sky-400">🕵️ Khám phá khách</Link> để đọc vị rồi bấm “Lưu khách”, hoặc thêm nhanh ở trên.
          </p>
        )}
      </ul>
    </main>
  );
}

const VERDICT_META: Record<string, { label: string; cls: string }> = {
  khoe: { label: "Đủ lực", cls: "text-emerald-500" },
  can_bien: { label: "Cận biên", cls: "text-amber-500" },
  chua_du: { label: "Cần thu xếp", cls: "text-red-500" },
};

function CustomerCard({ c }: { c: Customer }) {
  const next = (c.discovery as { nextActions?: string[] } | null)?.nextActions ?? [];
  const a = c.assessment as { verdict?: string; maxLoan?: number; maxPropertyPrice?: number } | null;
  return (
    <li className="flex flex-col gap-2 rounded-md border border-border bg-card px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{c.name}</span>
        {c.leadTier && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${TIER_META[c.leadTier].cls}`}>
            {TIER_META[c.leadTier].label}{c.leadScore != null ? ` ${c.leadScore}` : ""}
          </span>
        )}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{STATUS_LABEL[c.status]}</span>
        {c.incomeLow != null && c.incomeHigh != null && (
          <span className="text-xs text-muted-foreground">~{fmtTr(c.incomeLow)}–{fmtTr(c.incomeHigh)}/th</span>
        )}
        {c.nextFollowupAt && <span className="ml-auto text-xs text-muted-foreground">⏰ {c.nextFollowupAt}</span>}
      </div>

      {c.phone && (
        <div className="flex gap-2 text-sm">
          <a href={`tel:${c.phone}`} className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted">📞 {c.phone}</a>
          <a href={`https://zalo.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted">💬 Zalo</a>
        </div>
      )}

      {a && a.maxLoan != null && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 rounded-lg bg-muted/40 px-3 py-1.5 text-xs">
          <span className="font-semibold">💰 Đánh giá vay:</span>
          {a.verdict && <span className={VERDICT_META[a.verdict]?.cls}>{VERDICT_META[a.verdict]?.label ?? a.verdict}</span>}
          <span className="text-muted-foreground">Vay tối đa ~{fmtTr(a.maxLoan)}</span>
          {a.maxPropertyPrice != null && <span className="text-muted-foreground">· Mua tới ~{fmtTr(a.maxPropertyPrice)}</span>}
        </div>
      )}

      {next.length > 0 && <p className="text-xs text-muted-foreground">🎯 {next[0]}</p>}
      {c.note && <p className="text-sm">{c.note}</p>}

      <details>
        <summary className="cursor-pointer text-xs text-sky-400">Cập nhật</summary>
        <form action={updateCustomer} className="mt-2 flex flex-wrap items-end gap-2">
          <input type="hidden" name="id" value={c.id} />
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Trạng thái
            <select name="status" defaultValue={c.status} className="rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground">
              {(Object.keys(STATUS_LABEL) as CustomerStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            Hẹn theo lại
            <input name="next_followup_at" type="date" defaultValue={c.nextFollowupAt ?? ""} className="rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground" />
          </label>
          <input name="note" defaultValue={c.note ?? ""} placeholder="Ghi chú" className="min-w-40 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground" />
          <Button type="submit" variant="outline" className="px-3 py-2 text-sm">Lưu</Button>
        </form>
        <form action={deleteCustomer} className="mt-2">
          <input type="hidden" name="id" value={c.id} />
          <button className="text-xs text-red-400 hover:underline">Xoá khách</button>
        </form>
      </details>
    </li>
  );
}
