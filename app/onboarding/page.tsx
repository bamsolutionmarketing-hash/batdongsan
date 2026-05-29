"use client";

import { useState, useTransition } from "react";
import { createOrg, type OnboardingState } from "./actions";

const initial: OnboardingState = {};

export default function OnboardingPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createOrg(initial, formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Tạo tổ chức</h1>
        <p className="text-sm text-slate-400">
          Tạo không gian cho sàn/đội của bạn. Bạn sẽ là quản trị viên, có thể nạp dự án và mời thành viên.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          name="orgName"
          required
          placeholder="Tên sàn / công ty"
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {pending ? "Đang tạo…" : "Tạo & bắt đầu"}
        </button>
      </form>
    </main>
  );
}
