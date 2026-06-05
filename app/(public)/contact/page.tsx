"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitLead, type ContactState } from "./actions";

const initial: ContactState = {};
const input =
  "rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none focus:border-sky-500";

export default function ContactPage() {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ContactState>(initial);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState(initial);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => setState(await submitLead(initial, formData)));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Đăng ký dùng cho team</h1>
        <p className="text-sm text-muted-foreground">
          Trang bị kiến thức dự án + nội dung bán hàng cho cả đội sale của bạn — rút ngắn thời gian
          đào tạo nhân viên mới. Để lại thông tin, chúng tôi sẽ liên hệ tư vấn gói phù hợp.
        </p>
      </div>

      {state.ok ? (
        <div className="rounded-lg border border-emerald-600/50 bg-emerald-500/10 p-6">
          <p className="text-emerald-200">
            Cảm ơn bạn! Chúng tôi đã nhận thông tin và sẽ liên hệ sớm.
          </p>
          <Link href="/" className="mt-3 inline-block text-sm text-foreground hover:text-foreground">
            ← Về trang chủ
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Email / Số điện thoại *
            <input name="contact" required className={input} placeholder="ban@congty.vn" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Tên sàn / công ty
            <input name="orgName" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Số lượng sale (dự kiến)
            <input name="seats" type="number" min="0" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Lời nhắn
            <textarea name="message" rows={3} className={input} />
          </label>
          {state.error && <p className="text-sm text-red-400">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {pending ? "Đang gửi…" : "Gửi đăng ký"}
          </button>
          <Link href="/" className="text-center text-sm text-muted-foreground hover:text-foreground">
            ← Về trang chủ
          </Link>
        </form>
      )}
    </main>
  );
}
