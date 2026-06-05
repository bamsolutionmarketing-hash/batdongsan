import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listRecentPosts } from "@/lib/repo/posts";

const DOW = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// Month view marking days that have a post.
export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const res = await listRecentPosts(session.userId, 60);
  const postDays = new Set((res.ok ? res.data : []).map((p) => p.createdAt.slice(0, 10)));

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const first = new Date(Date.UTC(y, m, 1));
  const startCol = (first.getUTCDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const todayStr = now.toISOString().slice(0, 10);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const ymd = (d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Lịch đăng — {m + 1}/{y}</h1>
      <p className="text-sm text-slate-500">Ngày có chấm xanh là ngày bạn đã tạo bài.</p>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {DOW.map((d) => <div key={d} className="py-1 text-slate-500">{d}</div>)}
        {cells.map((d, i) => {
          if (d == null) return <div key={`e${i}`} />;
          const ds = ymd(d);
          const has = postDays.has(ds);
          const isToday = ds === todayStr;
          return (
            <div key={ds} className={`flex h-12 flex-col items-center justify-center rounded-md border ${isToday ? "border-sky-600" : "border-slate-800"} bg-slate-900`}>
              <span className="text-slate-200">{d}</span>
              {has && <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />}
            </div>
          );
        })}
      </div>
    </main>
  );
}
