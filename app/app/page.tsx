import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { signout } from "@/app/login/actions";

export default async function AppHome() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.profile?.org_id) redirect("/onboarding");

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trợ lý bán hàng</h1>
          <p className="text-sm text-slate-400">
            {session.email} · vai trò: {session.profile.role === "admin" ? "Quản trị" : "Sale"}
          </p>
        </div>
        <form action={signout}>
          <button className="rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500">
            Đăng xuất
          </button>
        </form>
      </header>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-6">
        <p className="text-slate-300">
          Chào mừng. Bước tiếp theo (M2): chọn dự án để xem bản đồ, learning hub và tạo nội dung bán hàng.
        </p>
      </section>
    </main>
  );
}
