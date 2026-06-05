import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/repo/projects";
import { nodesByProject, linksByProject } from "@/lib/repo/nodes";
import { getDeveloper } from "@/lib/repo/developers";
import { buildGraph } from "@/lib/map/buildGraph";
import { ProjectKnowledgeMap } from "@/components/map/ProjectKnowledgeMap";

// Public project page — renders the knowledge map from the new schema.
export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const res = await getProjectBySlug(params.slug);
  if (!res.ok || !res.data) notFound();
  const project = res.data;

  const [nodesRes, linksRes, devRes] = await Promise.all([
    nodesByProject(project.id),
    linksByProject(project.id),
    getDeveloper(project.developerId),
  ]);
  const nodes = nodesRes.ok ? nodesRes.data : [];
  const links = linksRes.ok ? linksRes.data : [];
  const developer = devRes.ok ? devRes.data : null;
  const { graph, notesById } = buildGraph(nodes, links);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">
            {developer && `${developer.name} · `}
            {project.locationText}
          </p>
          {project.phase && <p className="mt-0.5 text-xs text-amber-400/80">{project.phase}</p>}
        </div>
        <Link href="/" className="whitespace-nowrap text-sm text-muted-foreground hover:text-foreground">
          ← Trang chủ
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact label="Trạng thái" value={statusVi(project.status)} />
        <Fact label="Giá tham chiếu" value={priceLabel(project.priceMin, project.priceMax)} />
        <Fact label="Số điểm tri thức" value={`${graph.nodes.length}`} />
        <Fact label="Liên kết" value={`${graph.links.length}`} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Bản đồ tri thức dự án
        </h2>
        <ProjectKnowledgeMap data={graph} notesById={notesById} />
      </section>
    </main>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}

function statusVi(s: string | null): string {
  const map: Record<string, string> = {
    open: "Đang mở",
    selling: "Mở bán",
    handover: "Bàn giao",
    completed: "Hoàn thành",
    planning: "Quy hoạch",
  };
  return s ? map[s] ?? s : "";
}

function priceLabel(min: number | null, max: number | null): string {
  const m = (v: number) => Math.round(v / 1_000_000);
  if (min && max) return `${m(min)}–${m(max)} tr/m²`;
  if (min) return `từ ${m(min)} tr/m²`;
  if (max) return `đến ${m(max)} tr/m²`;
  return "";
}
