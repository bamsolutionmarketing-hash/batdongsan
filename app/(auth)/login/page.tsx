"use client";

import { useState, useTransition } from "react";
import { login, signup, type AuthState } from "./actions";

const initial: AuthState = {};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string };
}) {
  const redirectTo = searchParams.redirect ?? "/dashboard";
  const [pending, startTransition] = useTransition();
  const [loginError, setLoginError] = useState<string>();
  const [signupError, setSignupError] = useState<string>();

  // Drive the server action from a transition (React 18-compatible; redirect()
  // inside the action propagates and is handled by Next).
  function submit(
    action: (prev: AuthState, fd: FormData) => Promise<AuthState>,
    setError: (msg?: string) => void,
  ) {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(undefined);
      const formData = new FormData(e.currentTarget);
      startTransition(async () => {
        const res = await action(initial, formData);
        if (res?.error) setError(res.error);
      });
    };
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-sky-400">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-sky-600 text-[11px] font-bold text-white">BĐS</span>
          Trợ lý BĐS
        </p>
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">Trợ lý bán hàng BĐS cho đội sale của bạn.</p>
      </div>

      <form onSubmit={submit(login, setLoginError)} className="flex flex-col gap-3">
        <input type="hidden" name="redirect" value={redirectTo} />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Mật khẩu"
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        {loginError && <p className="text-sm text-red-400">{loginError}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {pending ? "Đang đăng nhập…" : "Đăng nhập"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-muted" /> hoặc <span className="h-px flex-1 bg-muted" />
      </div>

      <form onSubmit={submit(signup, setSignupError)} className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Chưa có tài khoản? Đăng ký:</p>
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          className="rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        {signupError && <p className="text-sm text-red-400">{signupError}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-border px-3 py-2 text-sm font-medium hover:border-foreground/30 disabled:opacity-50"
        >
          {pending ? "Đang tạo…" : "Đăng ký"}
        </button>
      </form>
    </main>
  );
}
