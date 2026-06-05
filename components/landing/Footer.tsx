import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-subtle">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span className="grid h-6 w-6 place-items-center rounded bg-primary text-[10px] font-bold text-primary-foreground">BĐS</span>
          Trợ lý BĐS
        </div>
        <div className="flex items-center gap-5">
          <a href="#features" className="transition hover:text-foreground">Tính năng</a>
          <Link href="/pricing" className="transition hover:text-foreground">Bảng giá</Link>
          <Link href="/contact" className="transition hover:text-foreground">Liên hệ</Link>
          <Link href="/login" className="transition hover:text-foreground">Đăng nhập</Link>
        </div>
        <span>© {new Date().getFullYear()} Trợ lý BĐS</span>
      </div>
    </footer>
  );
}
