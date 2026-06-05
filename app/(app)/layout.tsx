import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signout } from "@/app/(auth)/login/actions";
import { BottomNav } from "@/components/app/BottomNav";

// Auth guard for the agent app. Redirects to /login when signed out.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const admin = session.profile?.role === "admin";

  return (
    <div className="min-h-screen">
      {/* Desktop / tablet top nav */}
      <nav className="hidden items-center gap-4 border-b border-slate-800 bg-slate-950 px-6 py-3 text-sm sm:flex">
        <Link href="/dashboard" className="font-semibold text-slate-100">Hôm Nay</Link>
        <Link href="/projects" className="text-slate-400 hover:text-slate-200">Dự án</Link>
        <Link href="/calendar" className="text-slate-400 hover:text-slate-200">Lịch</Link>
        <Link href="/notes" className="text-slate-400 hover:text-slate-200">Ghi chú</Link>
        <Link href="/settings" className="text-slate-400 hover:text-slate-200">Thương hiệu</Link>
        {admin && (
          <Link href="/admin/projects" className="text-amber-400/90 hover:text-amber-300">Admin</Link>
        )}
        <form action={signout} className="ml-auto">
          <button className="text-slate-500 hover:text-slate-300">Đăng xuất</button>
        </form>
      </nav>

      {/* Mobile top bar — brand + admin/logout (primary nav is the bottom bar) */}
      <header className="flex items-center gap-3 border-b border-slate-800 bg-slate-950 px-4 py-3 text-sm sm:hidden">
        <Link href="/dashboard" className="font-semibold text-slate-100">Trợ lý BĐS</Link>
        <div className="ml-auto flex items-center gap-4">
          {admin && <Link href="/admin/projects" className="text-amber-400/90">Admin</Link>}
          <form action={signout}>
            <button className="text-slate-500">Đăng xuất</button>
          </form>
        </div>
      </header>

      {/* Bottom padding clears the fixed mobile tab bar */}
      <div className="pb-20 sm:pb-0">{children}</div>
      <BottomNav />
    </div>
  );
}
