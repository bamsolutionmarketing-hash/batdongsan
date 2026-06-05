"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS } from "./nav-items";

// Desktop top-bar links with active-route highlight.
export function NavLinks({ admin }: { admin?: boolean }) {
  const path = usePathname() ?? "";
  const active = (href: string) => path === href || path.startsWith(href + "/");
  const cls = (on: boolean) =>
    `rounded-md px-3 py-1.5 text-sm transition ${on ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"}`;
  return (
    <div className="flex items-center gap-1">
      {NAV_TABS.map((t) => (
        <Link key={t.href} href={t.href} className={cls(active(t.href))}>{t.label}</Link>
      ))}
      {admin && (
        <Link
          href="/admin/projects"
          className={`rounded-md px-3 py-1.5 text-sm transition ${active("/admin") ? "bg-amber-950/40 text-amber-300" : "text-amber-400/90 hover:bg-amber-950/30 hover:text-amber-300"}`}
        >
          Admin
        </Link>
      )}
    </div>
  );
}
