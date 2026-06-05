import { listPublishedProjects } from "@/lib/repo/projects";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";

export default async function ProjectsPage() {
  const res = await listPublishedProjects();
  const projects = res.ok ? res.data : [];
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Dự án</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardTitle>{p.name}</CardTitle>
            {p.locationText && <CardDesc>{p.locationText}</CardDesc>}
            <ButtonLink href={`/projects/${p.slug}`} variant="outline" className="mt-4">
              Mở bản đồ
            </ButtonLink>
          </Card>
        ))}
      </div>
    </main>
  );
}
