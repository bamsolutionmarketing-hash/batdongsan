"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createProject, type ProjectFormState } from "../actions";

const initial: ProjectFormState = {};

const input =
  "rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500";

export default function NewProjectPage() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createProject(initial, formData);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thêm dự án</h1>
        <Link href="/app" className="text-sm text-slate-400 hover:text-slate-200">
          ← Quay lại
        </Link>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Tên dự án *
          <input name="name" required className={input} placeholder="VD: Masteri Thảo Điền" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Chủ đầu tư
            <input name="developer" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Giá (triệu/m²)
            <input name="pricePerSqmM" type="number" step="any" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Quận / khu vực
            <input name="district" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Thành phố
            <input name="city" defaultValue="TP.HCM" className={input} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Phân khúc
            <select name="segment" defaultValue="mid-range" className={input}>
              <option value="luxury">Hạng sang</option>
              <option value="high-end">Cao cấp</option>
              <option value="mid-range">Trung cấp</option>
              <option value="affordable">Bình dân</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Trạng thái
            <select name="status" defaultValue="selling" className={input}>
              <option value="planning">Quy hoạch</option>
              <option value="selling">Mở bán</option>
              <option value="handover">Bàn giao</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          Tiện ích (cách nhau bởi dấu phẩy)
          <input name="amenities" className={input} placeholder="hồ bơi, gym, công viên" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          ID dự án liên quan (cách nhau bởi dấu phẩy)
          <input name="relatedIds" className={input} placeholder="uuid-1, uuid-2" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="visibility" value="public" />
          Công khai (hiển thị cho người chưa đăng nhập — dùng cho dự án demo)
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {pending ? "Đang lưu…" : "Lưu dự án"}
        </button>
      </form>
    </main>
  );
}
