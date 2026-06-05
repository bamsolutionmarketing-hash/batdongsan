import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <span className="grid h-6 w-6 place-items-center rounded bg-sky-600 text-[10px] font-bold text-white">BĐS</span>
          Trợ lý BĐS
        </div>
        <div className="flex items-center gap-5">
          <a href="#features" className="hover:text-slate-300">Tính năng</a>
          <Link href="/pricing" className="hover:text-slate-300">Bảng giá</Link>
          <Link href="/contact" className="hover:text-slate-300">Liên hệ</Link>
          <Link href="/login" className="hover:text-slate-300">Đăng nhập</Link>
        </div>
        <span>© {new Date().getFullYear()} Trợ lý BĐS</span>
      </div>
    </footer>
  );
}
