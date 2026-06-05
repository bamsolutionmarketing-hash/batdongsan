"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Sticky marketing header. Transparent over the light hero (dark text); turns
// into a dark frosted bar (light text) once scrolled into the dark body.
export function MarketingHeader() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const brand = solid ? "text-slate-100" : "text-slate-900";
  const link = solid ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900";
  const login = solid ? "text-slate-300 hover:text-white" : "text-slate-700 hover:text-slate-900";

  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-slate-800 bg-slate-950/80 backdrop-blur" : "border-b border-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className={`flex items-center gap-2 font-semibold ${brand}`}>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-amber-300 to-yellow-500 text-[11px] font-bold text-slate-950">BĐS</span>
          <span className="font-display tracking-tight">Trợ lý BĐS</span>
        </Link>
        <nav className="ml-3 hidden items-center gap-1 text-sm sm:flex">
          <a href="#features" className={`rounded-md px-3 py-1.5 transition ${link}`}>Tính năng</a>
          <a href="#demo" className={`rounded-md px-3 py-1.5 transition ${link}`}>Demo</a>
          <a href="#pricing" className={`rounded-md px-3 py-1.5 transition ${link}`}>Bảng giá</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className={`rounded-md px-3 py-1.5 text-sm transition ${login}`}>Đăng nhập</Link>
          <Link href="/signup" className="rounded-md bg-gradient-to-r from-amber-300 to-yellow-500 px-3 py-1.5 text-sm font-semibold text-slate-950 shadow-sm shadow-amber-900/30 transition hover:from-amber-200 hover:to-yellow-400">Dùng thử</Link>
        </div>
      </div>
    </header>
  );
}
