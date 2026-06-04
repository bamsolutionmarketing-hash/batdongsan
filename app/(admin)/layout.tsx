import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session)) redirect("/");
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-4 border-b border-amber-900/40 bg-slate-950 px-6 py-3 text-sm">
        <span className="font-semibold text-amber-400">Admin</span>
        <Link href="/admin/projects" className="text-slate-400 hover:text-slate-200">Dự án</Link>
        <Link href="/dashboard" className="ml-auto text-slate-500 hover:text-slate-300">← App</Link>
      </nav>
      {children}
    </div>
  );
}
