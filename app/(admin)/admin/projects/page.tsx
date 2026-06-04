import { listAllProjects } from "@/lib/repo/projects";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";

export default async function AdminProjectsPage() {
  const res = await listAllProjects();
  const projects = res.ok ? res.data : [];
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Dự án (Admin)</h1>
      <p className="text-sm text-slate-500">CRUD đầy đủ (nodes/links/blocks/assets) ở S2.</p>
      <div className="flex flex-col gap-3">
        {projects.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">{p.name}</CardTitle>
              <CardDesc>
                {p.slug} · {p.isPublished ? "đã xuất bản" : "nháp"}
                {p.isDemo ? " · demo" : ""}
              </CardDesc>
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
