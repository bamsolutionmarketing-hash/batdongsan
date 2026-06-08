import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isAdmin } from "@/lib/auth";
import { signout } from "@/app/(auth)/login/actions";
import { BottomNav } from "@/components/app/BottomNav";
import { NavLinks } from "@/components/app/NavLinks";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo, BrandWatermark } from "@/components/landing/Logo";

// Auth guard for the agent app. Redirects to /login when signed out.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const admin = isAdmin(session);

  return (
    <div className="min-h-screen">
      {/* Desktop / tablet top nav — sticky, active-aware */}
      <nav className="sticky top-0 z-30 hidden items-center gap-4 border-b border-border bg-background/80 px-6 py-3 backdrop-blur sm:flex"
           style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <Link href="/dashboard" className="mr-1" aria-label="NhaPilot"><Logo /></Link>
        <NavLinks admin={admin} />
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <form action={signout}>
            <button className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted/60 hover:text-foreground">Đăng xuất</button>
          </form>
        </div>
      </nav>

      {/* Mobile top bar — brand + admin/logout (primary nav is the bottom bar) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 text-sm backdrop-blur sm:hidden"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}>
        <Link href="/dashboard" aria-label="NhaPilot"><Logo /></Link>
        <div className="ml-auto flex items-center gap-3">
          {admin && <Link href="/admin/projects" className="text-brand">Admin</Link>}
          <ThemeToggle />
          <form action={signout}>
            <button className="text-muted-foreground">Đăng xuất</button>
          </form>
        </div>
      </header>

      {/* Bottom padding clears the fixed mobile tab bar (+ home-indicator inset) */}
      <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">{children}</div>
      <BottomNav />
      {/* Persistent brand watermark (desktop corner) */}
      <BrandWatermark className="fixed bottom-3 right-3 z-20 hidden opacity-30 sm:inline-flex" />
    </div>
  );
}
