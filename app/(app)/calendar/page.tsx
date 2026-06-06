import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listRecentPosts } from "@/lib/repo/posts";
import { listTriggers } from "@/lib/repo/triggers";
import { listPublishedProjects } from "@/lib/repo/projects";
import { listEventsInRange, type CalendarEvent } from "@/lib/repo/calendar";
import { addEvent, deleteEvent } from "./_actions";

const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const pad = (n: number) => String(n).padStart(2, "0");
const todayUTC = () => new Date().toISOString().slice(0, 10);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";
const daysFromToday = (dateStr: string) =>
  Math.round((Date.parse(`${dateStr}T00:00:00Z`) - Date.parse(`${todayUTC()}T00:00:00Z`)) / 86400000);

// Month planner: posted days (count) + campaign deadlines + personal events.
export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { y?: string; m?: string; d?: string; error?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Target month (nav via ?y=&m=, m is 1-based).
  const now = new Date();
  const y = Number(searchParams.y) || now.getUTCFullYear();
  const m = (Number(searchParams.m) || now.getUTCMonth() + 1) - 1; // 0-based
  const first = new Date(Date.UTC(y, m, 1));
  const startCol = (first.getUTCDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const todayStr = todayUTC();
  const ymd = (d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const monthFrom = ymd(1);
  const monthTo = ymd(daysInMonth);

  const [postsRes, trigRes, eventsRes, projRes] = await Promise.all([
    listRecentPosts(session.userId, 200),
    listTriggers(),
    listEventsInRange(session.userId, monthFrom, monthTo),
    listPublishedProjects(),
  ]);

  // Posted posts per day (marked "đã đăng").
  const postCount = new Map<string, number>();
  for (const p of postsRes.ok ? postsRes.data : []) {
    if (!p.postedAt) continue;
    const d = p.postedAt.slice(0, 10);
    postCount.set(d, (postCount.get(d) ?? 0) + 1);
  }
  // Campaign deadlines per day.
  const triggers = trigRes.ok ? trigRes.data : [];
  const triggerByDay = new Map<string, string[]>();
  for (const t of triggers) {
    triggerByDay.set(t.triggerDate, [...(triggerByDay.get(t.triggerDate) ?? []), t.label]);
  }
  // Personal events per day.
  const events = eventsRes.ok ? eventsRes.data : [];
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    eventsByDay.set(e.eventDate, [...(eventsByDay.get(e.eventDate) ?? []), e]);
  }
  const projects = projRes.ok ? projRes.data : [];

  // Selected day (?d=YYYY-MM-DD) for the add/edit panel.
  const selectedDay = searchParams.d && DATE_RE.test(searchParams.d) ? searchParams.d : null;
  const dayEvents = selectedDay ? eventsByDay.get(selectedDay) ?? [] : [];

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
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lịch đăng — {m + 1}/{y}</h1>
        <div className="flex items-center gap-2 text-sm">
          <Link href={`/calendar?y=${prevM.y}&m=${prevM.m}`} className="rounded border border-border px-2 py-1 text-foreground hover:border-foreground/30">←</Link>
          <Link href="/calendar" className="rounded border border-border px-2 py-1 text-muted-foreground hover:border-foreground/30">Nay</Link>
          <Link href={`/calendar?y=${nextM.y}&m=${nextM.m}`} className="rounded border border-border px-2 py-1 text-foreground hover:border-foreground/30">→</Link>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Chấm xanh = đã đăng (số bài). ⏳ = hạn chiến dịch. 📌 = sự kiện. Chạm một ngày để thêm/xem sự kiện.</p>

      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {DOW.map((d) => <div key={d} className="py-1 text-muted-foreground">{d}</div>)}
        {cells.map((d, i) => {
          if (d == null) return <div key={`e${i}`} />;
          const ds = ymd(d);
          const count = postCount.get(ds) ?? 0;
          const deadlines = triggerByDay.get(ds);
          const dayEvs = eventsByDay.get(ds);
          const isToday = ds === todayStr;
          const isSelected = ds === selectedDay;
          return (
            <Link
              key={ds}
              href={`/calendar?y=${y}&m=${m + 1}&d=${ds}`}
              scroll={false}
              title={[...(deadlines ?? []), ...(dayEvs?.map((e) => `📌 ${e.title}`) ?? [])].join(" · ")}
              className={`flex h-12 flex-col items-center justify-center rounded-md border transition hover:border-foreground/40 ${isSelected ? "border-sky-500 ring-1 ring-sky-500" : isToday ? "border-sky-600" : deadlines ? "border-amber-700/60" : "border-border"} bg-card`}
            >
              <span className="text-foreground">{d}</span>
              <span className="mt-0.5 flex items-center gap-0.5">
                {count > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{count > 1 ? count : ""}
                  </span>
                )}
                {deadlines && <span className="text-[10px]">⏳</span>}
                {dayEvs && <span className="text-[10px]">📌</span>}
              </span>
            </Link>
          );
        })}
      </div>

      {selectedDay && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Sự kiện ngày {selectedDay}</h2>
          {searchParams.error && (
            <p className="mt-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{searchParams.error}</p>
          )}

          {dayEvents.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-2">
              {dayEvents.map((e) => (
                <li key={e.id} className="flex items-start gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                  <span className="text-amber-400">📌</span>
                  <div className="min-w-0">
                    <p className="text-foreground">{e.title}</p>
                    {e.note && <p className="text-xs text-muted-foreground">{e.note}</p>}
                    {e.projectName && <p className="text-xs text-sky-400">{e.projectName}</p>}
                  </div>
                  <form action={deleteEvent} className="ml-auto">
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="event_date" value={selectedDay} />
                    <input type="hidden" name="y" value={y} />
                    <input type="hidden" name="m" value={m + 1} />
                    <button className="text-xs text-red-400 hover:text-red-300">Xóa</button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Chưa có sự kiện. Thêm bên dưới.</p>
          )}

          <form action={addEvent} className="mt-3 flex flex-col gap-2">
            <input type="hidden" name="event_date" value={selectedDay} />
            <input type="hidden" name="y" value={y} />
            <input type="hidden" name="m" value={m + 1} />
            <input name="title" placeholder="Tiêu đề sự kiện *" required className={input} />
            <input name="note" placeholder="Ghi chú (tùy chọn)" className={input} />
            <select name="project_id" defaultValue="" className={input}>
              <option value="">— Không gắn dự án —</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Thêm sự kiện</button>
          </form>
        </section>
      )}

      {upcoming.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Hạn sắp tới</h2>
          <ul className="flex flex-col gap-2">
            {upcoming.map((t, i) => (
              <li key={`${t.triggerDate}-${i}`} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
                <span className="text-amber-400">⏳</span>
                <span className="text-foreground">{t.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{t.triggerDate}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${t.left <= 2 ? "bg-red-950/40 text-red-300" : "bg-muted text-foreground"}`}>
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
