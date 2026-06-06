import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProjectById } from "@/lib/repo/projects";
import { canAccessProject } from "@/lib/repo/access";
import { ScriptPanel } from "@/components/script/ScriptPanel";

// Video script result page. Reached only from a project map ("Tạo video" with
// picked nodes) — video is always node-driven. Missing pieces redirect back.
export default async function ScriptsPage({
  searchParams,
}: {
  searchParams: { project?: string; nodes?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const projectId = searchParams.project;
  if (!projectId) redirect("/projects");

  const res = await getProjectById(projectId);
  const project = res.ok ? res.data : null;
  if (!project) redirect("/projects");
  if (!(await canAccessProject(session.userId, project.id))) redirect("/projects");

  const nodeIds = searchParams.nodes?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
  // No nodes picked → send to the map to choose talking points first.
  if (nodeIds.length === 0) redirect(`/projects/${project.slug}`);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">🎬 Kịch bản video</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
        <Link href={`/projects/${project.slug}`} className="text-sm text-sky-400 hover:underline">← Chọn điểm khác</Link>
      </header>
      <ScriptPanel projectId={project.id} nodeIds={nodeIds} projectName={project.name} />
    </main>
  );
}
