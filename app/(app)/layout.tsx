import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signout } from "@/app/(auth)/login/actions";

// Auth guard for the agent app. Redirects to /login when signed out.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const admin = session.profile?.role === "admin";

  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-4 border-b border-slate-800 bg-slate-950 px-6 py-3 text-sm">
        <Link href="/dashboard" className="font-semibold text-slate-100">Hôm Nay</Link>
        <Link href="/projects" className="text-slate-400 hover:text-slate-200">Dự án</Link>
        <Link href="/notes" className="text-slate-400 hover:text-slate-200">Ghi chú</Link>
        <Link href="/settings" className="text-slate-400 hover:text-slate-200">Thương hiệu</Link>
        {admin && (
          <Link href="/admin/projects" className="text-amber-400/90 hover:text-amber-300">Admin</Link>
        )}
        <form action={signout} className="ml-auto">
          <button className="text-slate-500 hover:text-slate-300">Đăng xuất</button>
        </form>
      </nav>
      {children}
    </div>
  );
}
