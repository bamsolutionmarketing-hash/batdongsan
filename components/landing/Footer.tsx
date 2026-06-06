import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-subtle">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <div className="flex items-center gap-5">
          <a href="#features" className="transition hover:text-foreground">Tính năng</a>
          <Link href="/pricing" className="transition hover:text-foreground">Bảng giá</Link>
          <Link href="/contact" className="transition hover:text-foreground">Liên hệ</Link>
          <Link href="/login" className="transition hover:text-foreground">Đăng nhập</Link>
        </div>
        <span>© {new Date().getFullYear()} NhaPilot</span>
      </div>
    </footer>
  );
}
