import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listRecentPosts } from "@/lib/repo/posts";
import { listTriggers } from "@/lib/repo/triggers";

const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const pad = (n: number) => String(n).padStart(2, "0");
const todayUTC = () => new Date().toISOString().slice(0, 10);
const daysFromToday = (dateStr: string) =>
  Math.round((Date.parse(`${dateStr}T00:00:00Z`) - Date.parse(`${todayUTC()}T00:00:00Z`)) / 86400000);

// Month planner: posted days (count) + campaign deadlines + upcoming list.
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { y?: string; m?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [postsRes, trigRes] = await Promise.all([
    listRecentPosts(session.userId, 200),
    listTriggers(),
  ]);

  // Posts per day.
  const postCount = new Map<string, number>();
  for (const p of postsRes.ok ? postsRes.data : []) {
    const d = p.createdAt.slice(0, 10);
    postCount.set(d, (postCount.get(d) ?? 0) + 1);
  }
  // Campaign deadlines per day.
  const triggers = trigRes.ok ? trigRes.data : [];
  const triggerByDay = new Map<string, string[]>();
  for (const t of triggers) {
    triggerByDay.set(t.triggerDate, [...(triggerByDay.get(t.triggerDate) ?? []), t.label]);
  }

  // Target month (nav via ?y=&m=, m is 1-based).
  const now = new Date();
  const y = Number(searchParams.y) || now.getUTCFullYear();
  const m = (Number(searchParams.m) || now.getUTCMonth() + 1) - 1; // 0-based
  const first = new Date(Date.UTC(y, m, 1));
  const startCol = (first.getUTCDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const todayStr = todayUTC();
  const ymd = (d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevM = m === 0 ? { y: y - 1, m: 12 } : { y, m };
  const nextM = m === 11 ? { y: y + 1, m: 1 } : { y, m: m + 2 };

  // Upcoming deadlines (today onward, next ~90 days), soonest first.
  const upcoming = triggers
    .map((t) => ({ ...t, left: daysFromToday(t.triggerDate) }))
    .filter((t) => t.left >= 0 && t.left <= 90)
    .sort((a, b) => a.left - b.left);

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lịch đăng — {m + 1}/{y}</h1>
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/calendar?y=${prevM.y}&m=${prevM.m}`} className="rounded border border-slate-700 px-2 py-1 text-slate-300 hover:border-slate-500">←</Link>
          <Link href="/calendar" className="rounded border border-slate-700 px-2 py-1 text-slate-400 hover:border-slate-500">Nay</Link>
          <Link href={`/calendar?y=${nextM.y}&m=${nextM.m}`} className="rounded border border-slate-700 px-2 py-1 text-slate-300 hover:border-slate-500">→</Link>
        </div>
      </div>
      <p className="text-sm text-slate-500">Chấm xanh = đã đăng (số bài). ⏳ = hạn chiến dịch.</p>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {DOW.map((d) => <div key={d} className="py-1 text-slate-500">{d}</div>)}
        {cells.map((d, i) => {
          if (d == null) return <div key={`e${i}`} />;
          const ds = ymd(d);
          const count = postCount.get(ds) ?? 0;
          const deadlines = triggerByDay.get(ds);
          const isToday = ds === todayStr;
          return (
            <div
              key={ds}
              title={deadlines?.join(" · ")}
              className={`flex h-12 flex-col items-center justify-center rounded-md border ${isToday ? "border-sky-600" : deadlines ? "border-amber-700/60" : "border-slate-800"} bg-slate-900`}
            >
              <span className="text-slate-200">{d}</span>
              <span className="mt-0.5 flex items-center gap-0.5">
                {count > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{count > 1 ? count : ""}
                  </span>
                )}
                {deadlines && <span className="text-[10px]">⏳</span>}
              </span>
            </div>
          );
        })}
      </div>

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Hạn sắp tới</h2>
          <ul className="flex flex-col gap-2">
            {upcoming.map((t, i) => (
              <li key={`${t.triggerDate}-${i}`} className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
                <span className="text-amber-400">⏳</span>
                <span className="text-slate-100">{t.label}</span>
                <span className="ml-auto text-xs text-slate-500">{t.triggerDate}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${t.left <= 2 ? "bg-red-950/40 text-red-300" : "bg-slate-800 text-slate-300"}`}>
                  {t.left === 0 ? "hôm nay" : `còn ${t.left} ngày`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
