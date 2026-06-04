import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/repo/projects";
import { nodesByProject, linksByProject } from "@/lib/repo/nodes";
import { buildGraph } from "@/lib/map/buildGraph";
import { ProjectKnowledgeMap } from "@/components/map/ProjectKnowledgeMap";

export default async function AppProjectPage({ params }: { params: { slug: string } }) {
  const res = await getProjectBySlug(params.slug);
  if (!res.ok || !res.data) notFound();
  const project = res.data;
  const [nodesRes, linksRes] = await Promise.all([
    nodesByProject(project.id),
    linksByProject(project.id),
  ]);
  const { graph, notesById } = buildGraph(
    nodesRes.ok ? nodesRes.data : [],
    linksRes.ok ? linksRes.data : [],
  );
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Link href="/projects" className="text-sm text-slate-400 hover:text-slate-200">← Dự án</Link>
      </header>
      <p className="text-sm text-slate-500">
        Chế độ chọn điểm để tạo bài sẽ thêm ở S3. Hiện tại: xem bản đồ tri thức.
      </p>
      <ProjectKnowledgeMap data={graph} notesById={notesById} />
    </main>
  );
}
