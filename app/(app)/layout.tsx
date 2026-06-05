import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signout } from "@/app/(auth)/login/actions";
import { BottomNav } from "@/components/app/BottomNav";
import { NavLinks } from "@/components/app/NavLinks";

// Auth guard for the agent app. Redirects to /login when signed out.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const admin = session.profile?.role === "admin";

  return (
    <div className="min-h-screen">
      {/* Desktop / tablet top nav — sticky, active-aware */}
      <nav className="sticky top-0 z-30 hidden items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-6 py-3 backdrop-blur sm:flex">
        <Link href="/dashboard" className="mr-1 font-semibold text-slate-100">Trợ lý BĐS</Link>
        <NavLinks admin={admin} />
        <form action={signout} className="ml-auto">
          <button className="rounded-md px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-800/60 hover:text-slate-300">Đăng xuất</button>
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
