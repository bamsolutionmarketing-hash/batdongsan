import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getToday } from "@/lib/today";
import { getBranding } from "@/lib/repo/branding";
import { getAccessState } from "@/lib/repo/access";
import { listDueFollowups } from "@/lib/repo/customers";
import { createPostAction } from "@/app/(app)/projects/_actions";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const { post, alternates, tasks, streak } = await getToday(session.userId);
  const dueRes = await listDueFollowups(session.userId, new Date().toISOString().slice(0, 10));
  const dueCustomers = dueRes.ok ? dueRes.data : [];

  // Onboarding nudge for agents who haven't set branding + opened a project.
  let needsOnboarding = false;
  if (session.profile?.role === "agent") {
    const [bRes, access] = await Promise.all([getBranding(session.userId), getAccessState(session.userId)]);
    const b = bRes.ok ? bRes.data : null;
    const brandingReady = !!b && !!b.displayName?.trim() && !!b.phone?.trim();
    needsOnboarding = !brandingReady || access.accessible.size === 0;
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hôm Nay</h1>
        {streak > 0 && (
          <span className="rounded-full border border-amber-700/60 bg-amber-950/30 px-3 py-1 text-sm text-amber-300">
            🔥 {streak} ngày liên tục
          </span>
        )}
      </div>

      {needsOnboarding && (
        <Link href="/onboarding">
          <Card className="border-sky-700/60 bg-sky-950/20 transition hover:border-sky-600">
            <CardTitle>👋 Hoàn tất thiết lập trong 3 bước</CardTitle>
            <CardDesc>Đặt tên + SĐT, chọn dự án đầu tiên (miễn phí) và tạo bài đầu — chỉ vài phút.</CardDesc>
          </Card>
        </Link>
      )}

      {post ? (
        <Card className="border-sky-900/50">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wide text-sky-400">Gợi ý bài hôm nay</p>
            {post.daysLeft != null && post.daysLeft >= 0 && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs ${post.daysLeft <= 2 ? "bg-red-950/40 text-red-300 border border-red-800/60" : "bg-muted text-foreground"}`}>
                ⏳ còn {post.daysLeft} ngày
              </span>
            )}
          </div>
          <CardTitle className="mt-1">{post.title}</CardTitle>
          <CardDesc>{post.reason}</CardDesc>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.nodeLabels.map((l) => (
              <span key={l} className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-foreground">{l}</span>
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
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Gợi ý khác</h2>
          <div className="flex flex-col gap-2">
            {alternates.map((a) => (
              <div key={a.angle} className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
                <span className="text-sm font-medium text-foreground">{a.title}</span>
                <span className="text-xs text-muted-foreground">{a.nodeLabels.join(" · ")}</span>
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

      {dueCustomers.length > 0 && (
        <Link href="/customers">
          <Card className="border-amber-700/60 bg-amber-950/20 transition hover:border-amber-600">
            <CardTitle>⏰ {dueCustomers.length} khách cần theo hôm nay</CardTitle>
            <CardDesc>
              {dueCustomers.slice(0, 3).map((c) => c.name).join(" · ")}
              {dueCustomers.length > 3 ? "…" : ""} — gọi/nhắn trước khi khách nguội.
            </CardDesc>
          </Card>
        </Link>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Việc hôm nay ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Không có việc nào. 🎉</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => (
              <li key={t.id} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
                <span className="text-foreground">{t.kind === "note" ? "📝" : t.kind === "share" ? "🔁" : "📲"}</span>
                <span className="text-foreground">{t.label}</span>
                {t.kind === "note" && <Link href="/notes" className="ml-auto text-xs text-sky-400">Ghi chú →</Link>}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* lối tắt ghi chú — rời thanh điều hướng chính để nhường chỗ cho Khách */}
      <Link href="/notes" className="text-sm text-muted-foreground hover:text-foreground">📝 Ghi chú & nhắc hẹn →</Link>

      <Link href="/projects">
        <Card className="border-sky-900/50 transition hover:border-sky-700/70">
          <CardTitle>🎬 Tạo video / kịch bản</CardTitle>
          <CardDesc>Mở một dự án, chọn các điểm trên bản đồ rồi bấm “Tạo video” — kịch bản sẽ bám đúng nội dung điểm đã chọn.</CardDesc>
        </Card>
      </Link>
    </main>
  );
}
