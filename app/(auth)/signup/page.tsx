import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Đăng ký</h1>
      <p className="text-sm text-slate-400">
        Đăng ký email + Google sẽ bật khi có cấu hình OAuth. Tạm thời dùng trang đăng nhập.
      </p>
      <Link href="/login" className="rounded-md bg-sky-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-sky-500">
        Tới trang đăng nhập
      </Link>
    </main>
  );
}
