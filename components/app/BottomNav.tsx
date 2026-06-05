"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Hôm Nay", icon: "🏠" },
  { href: "/projects", label: "Dự án", icon: "🏢" },
  { href: "/calendar", label: "Lịch", icon: "🗓️" },
  { href: "/notes", label: "Ghi chú", icon: "📝" },
  { href: "/settings", label: "Hồ sơ", icon: "👤" },
];

// Mobile-only bottom tab bar — the primary nav on phones. Desktop uses the top
// bar (this is hidden on sm+).
export function BottomNav() {
  const path = usePathname() ?? "";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-800 bg-slate-950/95 backdrop-blur sm:hidden">
      {TABS.map((t) => {
        const active = path === t.href || path.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${active ? "text-sky-400" : "text-slate-400"}`}
          >
            <span className="text-lg leading-none">{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
