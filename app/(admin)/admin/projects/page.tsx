import Link from "next/link";
import { listAllProjects } from "@/lib/repo/projects";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

export default async function AdminProjectsPage() {
  const res = await listAllProjects();
  const projects = res.ok ? res.data : [];
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dự án (Admin)</h1>
        <ButtonLink href="/admin/projects/new">+ Dự án mới</ButtonLink>
      </div>
      <div className="flex flex-col gap-3">
        {projects.map((p) => (
          <Link key={p.id} href={`/admin/projects/${p.id}`}>
            <Card className="flex items-center justify-between transition hover:border-slate-600">
              <div>
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDesc>
                  {p.slug} · {p.isPublished ? "đã xuất bản" : "nháp"}
                  {p.isDemo ? " · demo" : ""}
                </CardDesc>
              </div>
              <span className="text-slate-500">→</span>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
