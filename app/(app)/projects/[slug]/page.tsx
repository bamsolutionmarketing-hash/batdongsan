import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/repo/projects";
import { nodesByProject, linksByProject } from "@/lib/repo/nodes";
import { getBranding } from "@/lib/repo/branding";
import { getSession } from "@/lib/auth";
import { buildGraph } from "@/lib/map/buildGraph";
import { MapSelection } from "@/components/map/MapSelection";
import { Notice } from "@/app/(admin)/admin/_Notice";

export default async function AppProjectPage({
  params, searchParams,
}: {
  params: { slug: string };
  searchParams: { error?: string };
}) {
  const res = await getProjectBySlug(params.slug);
  if (!res.ok || !res.data) notFound();
  const project = res.data;
  const session = await getSession();
  const [nodesRes, linksRes, brandingRes] = await Promise.all([
    nodesByProject(project.id),
    linksByProject(project.id),
    session ? getBranding(session.userId) : Promise.resolve({ ok: true as const, data: null }),
  ]);
  const b = brandingRes.ok ? brandingRes.data : null;
  const brandingReady = !!b && !!b.displayName?.trim() && !!b.phone?.trim();
  const { graph, notesById } = buildGraph(
    nodesRes.ok ? nodesRes.data : [],
    linksRes.ok ? linksRes.data : [],
  );
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">← Dự án</Link>
      </header>
      <Notice error={searchParams.error} />
      {!brandingReady && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Chưa có thương hiệu cá nhân. Hãy{" "}
          <Link href={`/settings?next=${encodeURIComponent(`/projects/${project.slug}`)}`} className="font-medium underline">
            thêm Tên + SĐT
          </Link>{" "}
          để bắt đầu tạo bài.
        </p>
      )}
      <MapSelection projectId={project.id} slug={project.slug} data={graph} notesById={notesById} />
    </main>
  );
}
