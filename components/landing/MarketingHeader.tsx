"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Sticky marketing header — transparent at top, frosted once scrolled.
export function MarketingHeader() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-slate-800 bg-slate-950/80 backdrop-blur" : "border-b border-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-100">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-sky-600 text-[11px] font-bold text-white">BĐS</span>
          Trợ lý BĐS
        </Link>
        <nav className="ml-3 hidden items-center gap-1 text-sm sm:flex">
          <a href="#features" className="rounded-md px-3 py-1.5 text-slate-400 transition hover:text-slate-200">Tính năng</a>
          <a href="#demo" className="rounded-md px-3 py-1.5 text-slate-400 transition hover:text-slate-200">Demo</a>
          <a href="#pricing" className="rounded-md px-3 py-1.5 text-slate-400 transition hover:text-slate-200">Bảng giá</a>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/login" className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition hover:text-white">Đăng nhập</Link>
          <Link href="/signup" className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-sky-950/40 transition hover:bg-sky-500">Dùng thử</Link>
        </div>
      </div>
    </header>
  );
}
