import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { signout } from "@/app/login/actions";
import { listProjectsWithSlug } from "@/lib/data/projects";
import { ProjectExplorer } from "@/components/map/ProjectExplorer";

export default async function AppHome() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.profile?.org_id) redirect("/onboarding");

  const isAdmin = session.profile.role === "admin";
  const { projects, slugById } = await listProjectsWithSlug();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Trợ lý bán hàng</h1>
          <p className="text-sm text-slate-400">
            {session.email} · vai trò: {isAdmin ? "Quản trị" : "Sale"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <Link
                href="/app/ingest"
                className="rounded-md border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 hover:border-slate-500"
              >
                Nạp tài liệu
              </Link>
              <Link
                href="/app/projects/new"
                className="rounded-md bg-sky-600 px-3 py-2 text-xs font-medium text-white hover:bg-sky-500"
              >
                + Thêm dự án
              </Link>
            </>
          )}
          <form action={signout}>
            <button className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500">
              Đăng xuất
            </button>
          </form>
        </div>
      </header>

      <ProjectExplorer projects={projects} slugById={slugById} />
    </main>
  );
}
