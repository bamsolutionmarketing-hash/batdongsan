import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!isAdmin(session)) redirect("/");
  return (
    <div className="min-h-screen">
      <nav className="flex items-center gap-4 border-b border-amber-900/40 bg-background px-6 py-3 text-sm">
        <Link href="/admin" className="font-semibold text-amber-400">Admin</Link>
        <Link href="/admin/projects" className="text-muted-foreground hover:text-foreground">Dự án</Link>
        <Link href="/dashboard" className="ml-auto text-muted-foreground hover:text-foreground">← App</Link>
      </nav>
      {children}
    </div>
  );
}
