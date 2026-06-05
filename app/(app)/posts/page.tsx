import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listPosts } from "@/lib/repo/posts";
import { markPosted, deletePost, duplicatePost } from "./_actions";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
const excerpt = (s: string, n = 140) => (s.length > n ? s.slice(0, n).trimEnd() + "…" : s);

// Library of generated posts: reopen / mark posted / duplicate / delete, filter
// by project.
export default async function PostsPage({ searchParams }: { searchParams: { project?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const res = await listPosts(session.userId, 200);
  let posts = res.ok ? res.data : [];

  const projects = Array.from(new Map(posts.map((p) => [p.projectSlug, p.projectName])).entries())
    .filter(([slug]) => slug);
  const filter = searchParams.project;
  if (filter) posts = posts.filter((p) => p.projectSlug === filter);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Bài đã tạo</h1>
        <span className="text-sm text-muted-foreground">{posts.length} bài</span>
      </div>

      {projects.length > 1 && (
        <div className="flex flex-wrap gap-1.5 text-xs">
          <Link href="/posts" className={`rounded-full px-3 py-1 ${!filter ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>Tất cả</Link>
          {projects.map(([slug, name]) => (
            <Link key={slug} href={`/posts?project=${slug}`} className={`rounded-full px-3 py-1 ${filter === slug ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}>{name}</Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Chưa có bài nào.</p>
          <Link href="/projects" className="mt-3 inline-block text-sm text-brand">Tạo bài đầu tiên →</Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {posts.map((p) => (
            <li key={p.id} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-muted px-2 py-0.5 text-foreground">{p.projectName}</span>
                <span>{fmt(p.createdAt)}</span>
                {p.postedAt ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-500">✓ đã đăng</span>
                ) : (
                  <span className="rounded-full border border-border px-2 py-0.5">nháp</span>
                )}
                <span className="ml-auto">{p.nodeIds.length} điểm</span>
              </div>
              <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-foreground">{excerpt(p.caption)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <Link href={`/projects/${p.projectSlug}/post/${p.id}`} className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground transition hover:bg-primary/90">Mở</Link>
                <form action={markPosted}>
                  <input type="hidden" name="post_id" value={p.id} />
                  <input type="hidden" name="posted" value={p.postedAt ? "0" : "1"} />
                  <button className="rounded-md border border-border px-3 py-1.5 text-foreground transition hover:bg-accent">{p.postedAt ? "Bỏ đánh dấu" : "Đánh dấu đã đăng"}</button>
                </form>
                <form action={duplicatePost}>
                  <input type="hidden" name="post_id" value={p.id} />
                  <button className="rounded-md border border-border px-3 py-1.5 text-foreground transition hover:bg-accent">Nhân bản</button>
                </form>
                <form action={deletePost} className="ml-auto">
                  <input type="hidden" name="post_id" value={p.id} />
                  <button className="rounded-md px-3 py-1.5 text-destructive transition hover:bg-destructive/10">Xóa</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
