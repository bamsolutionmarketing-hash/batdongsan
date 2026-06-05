"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS } from "./nav-items";

// Mobile-only bottom tab bar — the primary nav on phones. Desktop uses the top
// bar (this is hidden on sm+).
export function BottomNav() {
  const path = usePathname() ?? "";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      {NAV_TABS.map((t) => {
        const active = path === t.href || path.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${active ? "text-sky-400" : "text-muted-foreground"}`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
