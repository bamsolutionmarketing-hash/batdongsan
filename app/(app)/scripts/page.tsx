import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listPublishedProjects, getProjectById } from "@/lib/repo/projects";
import { ScriptPanel } from "@/components/script/ScriptPanel";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";

// Dedicated video-script page. Pick a project (?project=<id>) then generate.
export default async function ScriptsPage({
  searchParams,
}: {
  searchParams: { project?: string; nodes?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const projectId = searchParams.project;
  const nodeIds = searchParams.nodes?.split(",").map((s) => s.trim()).filter(Boolean);
  if (projectId) {
    const res = await getProjectById(projectId);
    const project = res.ok ? res.data : null;
    if (!project) redirect("/scripts");
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">🎬 Kịch bản video</h1>
            <p className="text-sm text-muted-foreground">{project.name}</p>
          </div>
          <Link href="/scripts" className="text-sm text-sky-400 hover:underline">← Đổi dự án</Link>
        </header>
        <ScriptPanel projectId={project.id} nodeIds={nodeIds} projectName={project.name} />
      </main>
    );
  }

  const res = await listPublishedProjects();
  const projects = res.ok ? res.data : [];
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">Tạo video / kịch bản</h1>
        <p className="text-sm text-muted-foreground">Chọn dự án để tạo kịch bản quay video (TikTok / Reels / Shorts).</p>
      </div>
      {projects.length === 0 ? (
        <Card>
          <CardTitle>Chưa có dự án</CardTitle>
          <CardDesc>Chưa có dự án nào để tạo kịch bản.</CardDesc>
        </Card>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {projects.map((p) => (
            <Link key={p.id} href={`/scripts?project=${p.id}`}>
              <Card className="h-full transition hover:border-foreground/30">
                <CardTitle className="text-base">{p.name}</CardTitle>
                {p.locationText && <CardDesc>{p.locationText}</CardDesc>}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
