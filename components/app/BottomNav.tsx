"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS } from "./nav-items";

// Mobile-only bottom tab bar — the primary nav on phones. Desktop uses the top
// bar (this is hidden on sm+).
export function BottomNav() {
  const path = usePathname() ?? "";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex select-none border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:hidden">
      {NAV_TABS.map((t) => {
        const active = path === t.href || path.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 flex-col items-center gap-1 pb-1.5 pt-2.5 text-[11px] font-medium transition active:scale-95 ${active ? "text-sky-400" : "text-muted-foreground"}`}
          >
            <span className={`text-[26px] leading-none transition-transform ${active ? "scale-110" : ""}`}>{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
