import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/repo/projects";
import { getDeveloper } from "@/lib/repo/developers";

// Public project teaser — image + basic info only. The knowledge map and all
// content are gated: visitors must sign in to view details & create posts.
export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const res = await getProjectBySlug(params.slug);
  if (!res.ok || !res.data) notFound();
  const project = res.data;
  const devRes = await getDeveloper(project.developerId);
  const developer = devRes.ok ? devRes.data : null;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Trang chủ</Link>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative aspect-[16/9] w-full bg-muted">
          {project.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnailUrl} alt={project.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-background text-5xl">🏢</div>
          )}
        </div>
        <div className="flex flex-col gap-2 p-6">
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            {developer && `${developer.name} · `}{project.locationText}
          </p>
          {project.phase && <p className="text-xs text-amber-400/80">{project.phase}</p>}

          <div className="mt-4 rounded-lg border border-border bg-background p-4 text-center">
            <p className="text-sm text-muted-foreground">Đăng nhập để xem chi tiết dự án, bản đồ tri thức và tạo bài đăng.</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Link href="/signup" className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Đăng ký miễn phí</Link>
              <Link href="/login" className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent">Đăng nhập</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
