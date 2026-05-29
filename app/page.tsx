import Link from "next/link";
import { ProjectExplorer } from "@/components/map/ProjectExplorer";
import { seedProjects } from "@/lib/data/seed";
import { listPublicProjectsWithSlug } from "@/lib/data/projects";
import type { Project } from "@/lib/data/types";

// Public landing/demo. Prefers seeded public projects (links into the real
// learning hub); falls back to in-memory seed when the DB is empty/unconfigured.
export default async function Home() {
  let projects: Project[] = seedProjects;
  let slugById: Record<string, string> | undefined;
  try {
    const res = await listPublicProjectsWithSlug();
    if (res.projects.length > 0) {
      projects = res.projects;
      slugById = res.slugById;
    }
  } catch {
    // No DB configured yet — show the in-memory seed demo.
  }

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bản đồ dự án BĐS — bản demo</h1>
          <p className="text-sm text-slate-400">
            Chọn một node để xem insight. Đăng nhập để nạp dự án của sàn bạn và tạo nội dung bán hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="whitespace-nowrap rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            Đăng ký cho team
          </Link>
          <Link
            href="/login"
            className="whitespace-nowrap rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            Đăng nhập
          </Link>
        </div>
      </header>

      <ProjectExplorer projects={projects} slugById={slugById} />
    </main>
  );
}
