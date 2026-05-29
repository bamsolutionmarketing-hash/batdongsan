import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProjectDetailBySlug } from "@/lib/data/projects";
import { getProjectMap } from "@/lib/data/project-map";
import { MapEditor } from "./MapEditor";

export default async function MapEditorPage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile?.role !== "admin") redirect("/app");

  const project = await getProjectDetailBySlug(params.slug);
  if (!project) notFound();

  const map = await getProjectMap(project.id);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bản đồ tri thức: {project.name}</h1>
          <p className="text-sm text-slate-400">
            Thêm các ý của dự án (tiện ích, điểm bán, vị trí, pháp lý…) và nối chúng lại. Cập nhật bất kỳ lúc nào.
          </p>
        </div>
        <Link href={`/p/${project.slug}`} className="text-sm text-slate-400 hover:text-slate-200">
          ← Xem trang dự án
        </Link>
      </div>

      <MapEditor
        slug={project.slug}
        graph={map.graph}
        notesById={map.notesById}
        nodes={map.nodes}
        edges={map.edges}
      />
    </main>
  );
}
