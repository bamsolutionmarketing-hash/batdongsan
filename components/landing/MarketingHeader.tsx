"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "./Logo";
import { InstallButton } from "@/components/pwa/PWA";

// Sticky marketing header — frosted, content-first (Mobbin-style).
export function MarketingHeader() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`sticky top-0 z-50 transition-colors duration-300 ${solid ? "border-b border-border bg-background/80 backdrop-blur-md" : "border-b border-transparent"}`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="NhaPilot"><Logo /></Link>
        <nav className="ml-3 hidden items-center gap-1 text-sm sm:flex">
          <a href="#features" className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:text-foreground">Tính năng</a>
          <a href="#demo" className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:text-foreground">Demo</a>
          <a href="#pricing" className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:text-foreground">Bảng giá</a>
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <InstallButton className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium text-foreground transition hover:bg-accent" />
          <ThemeToggle />
          <Link href="/login" className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground">Đăng nhập</Link>
          <Link href="/signup" className="rounded-md bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90">Dùng thử</Link>
        </div>
      </div>
    </header>
  );
}
