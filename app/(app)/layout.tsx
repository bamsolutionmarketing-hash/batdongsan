import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { signout } from "@/app/(auth)/login/actions";
import { BottomNav } from "@/components/app/BottomNav";
import { NavLinks } from "@/components/app/NavLinks";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// Auth guard for the agent app. Redirects to /login when signed out.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const admin = session.profile?.role === "admin";

  return (
    <div className="min-h-screen">
      {/* Desktop / tablet top nav — sticky, active-aware */}
      <nav className="sticky top-0 z-30 hidden items-center gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur sm:flex">
        <Link href="/dashboard" className="mr-1 font-semibold text-foreground">Trợ lý BĐS</Link>
        <NavLinks admin={admin} />
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <form action={signout}>
            <button className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/60 hover:text-foreground">Đăng xuất</button>
          </form>
        </div>
      </nav>

      {/* Mobile top bar — brand + admin/logout (primary nav is the bottom bar) */}
      <header className="flex items-center gap-3 border-b border-border bg-background px-4 py-3 text-sm sm:hidden">
        <Link href="/dashboard" className="font-semibold text-foreground">Trợ lý BĐS</Link>
        <div className="ml-auto flex items-center gap-3">
          {admin && <Link href="/admin/projects" className="text-brand">Admin</Link>}
          <ThemeToggle />
          <form action={signout}>
            <button className="text-muted-foreground">Đăng xuất</button>
          </form>
        </div>
      </header>

      {/* Bottom padding clears the fixed mobile tab bar */}
      <div className="pb-20 sm:pb-0">{children}</div>
      <BottomNav />
    </div>
  );
}
