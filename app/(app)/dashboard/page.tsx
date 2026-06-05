import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getToday } from "@/lib/today";
import { createPostAction } from "@/app/(app)/projects/_actions";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { post, alternates, tasks, streak } = await getToday(session.userId);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hôm Nay</h1>
        {streak > 0 && (
          <span className="rounded-full border border-amber-700/60 bg-amber-950/30 px-3 py-1 text-sm text-amber-300">
            🔥 {streak} ngày liên tục
          </span>
        )}
      </div>

      {post ? (
        <Card className="border-sky-900/50">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wide text-sky-400">Gợi ý bài hôm nay</p>
            {post.daysLeft != null && post.daysLeft >= 0 && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${post.daysLeft <= 2 ? "bg-red-950/40 text-red-300 border border-red-800/60" : "bg-slate-800 text-slate-300"}`}>
                ⏳ còn {post.daysLeft} ngày
              </span>
            )}
          </div>
          <CardTitle className="mt-1">{post.title}</CardTitle>
          <CardDesc>{post.reason}</CardDesc>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.nodeLabels.map((l) => (
              <span key={l} className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">{l}</span>
            ))}
          </div>
          <form action={createPostAction} className="mt-4">
            <input type="hidden" name="project_id" value={post.projectId} />
            <input type="hidden" name="slug" value={post.projectSlug} />
            <input type="hidden" name="node_ids" value={post.nodeIds.join(",")} />
            <Button type="submit">Tạo bài ngay →</Button>
          </form>
        </Card>
      ) : (
        <Card>
          <CardTitle>Chưa có gợi ý</CardTitle>
          <CardDesc>Chưa đủ dữ liệu node. Chọn một dự án để tạo bài thủ công.</CardDesc>
          <Link href="/projects" className="mt-3 inline-block text-sm text-sky-400">Xem dự án →</Link>
        </Card>
      )}

      {alternates.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Gợi ý khác</h2>
          <div className="flex flex-col gap-2">
            {alternates.map((a) => (
              <div key={a.angle} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
                <span className="text-sm font-medium text-slate-100">{a.title}</span>
                <span className="text-xs text-slate-500">{a.nodeLabels.join(" · ")}</span>
                <form action={createPostAction} className="ml-auto">
                  <input type="hidden" name="project_id" value={a.projectId} />
                  <input type="hidden" name="slug" value={a.projectSlug} />
                  <input type="hidden" name="node_ids" value={a.nodeIds.join(",")} />
                  <Button type="submit" variant="outline" className="px-2.5 py-1 text-xs">Tạo →</Button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Việc hôm nay ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-500">Không có việc nào. 🎉</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
                <span className="text-slate-300">{t.kind === "note" ? "📝" : t.kind === "share" ? "🔁" : "📲"}</span>
                <span className="text-slate-100">{t.label}</span>
                {t.kind === "note" && <Link href="/notes" className="ml-auto text-xs text-sky-400">Ghi chú →</Link>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
