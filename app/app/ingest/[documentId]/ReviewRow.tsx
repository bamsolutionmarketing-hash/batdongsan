"use client";

import { useState, useTransition } from "react";
import { confirmExtraction, rejectExtraction } from "../review-actions";

interface Row {
  id: string;
  field: string;
  value: string;
  source_span: string | null;
  confidence: number | null;
  status: "suggested" | "confirmed" | "rejected";
}

const FIELD_LABEL: Record<string, string> = {
  price_per_sqm: "Giá (triệu/m²)",
  district: "Khu vực",
  developer: "Chủ đầu tư",
  segment: "Phân khúc",
  amenities: "Tiện ích",
};

const STATUS_STYLE: Record<Row["status"], string> = {
  suggested: "border-slate-700 bg-slate-900",
  confirmed: "border-emerald-600/50 bg-emerald-500/5",
  rejected: "border-slate-800 bg-slate-950 opacity-60",
};

export function ReviewRow({ row, documentId }: { row: Row; documentId: string }) {
  const [value, setValue] = useState(row.value);
  const [status, setStatus] = useState(row.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  function run(action: typeof confirmExtraction, next: Row["status"]) {
    setError(undefined);
    const fd = new FormData();
    fd.set("extractionId", row.id);
    fd.set("documentId", documentId);
    fd.set("value", value);
    startTransition(async () => {
      const res = await action({}, fd);
      if (res?.error) setError(res.error);
      else setStatus(next);
    });
  }

  return (
    <li className={`rounded-lg border p-4 ${STATUS_STYLE[status]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {FIELD_LABEL[row.field] ?? row.field}
        </span>
        <span className="text-[10px] text-slate-500">
          tin cậy {Math.round((row.confidence ?? 0) * 100)}%
          {status === "confirmed" && " · đã xác nhận"}
          {status === "rejected" && " · đã bỏ"}
        </span>
      </div>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={status !== "suggested"}
        className="mt-2 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:opacity-60"
      />

      {row.source_span && (
        <p className="mt-2 rounded bg-slate-800/60 p-2 text-xs text-slate-400">
          <span className="text-slate-500">Nguồn: </span>…{row.source_span}…
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {status === "suggested" && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => run(confirmExtraction, "confirmed")}
            disabled={pending}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Xác nhận & áp dụng
          </button>
          <button
            onClick={() => run(rejectExtraction, "rejected")}
            disabled={pending}
            className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-400 disabled:opacity-50"
          >
            Bỏ qua
          </button>
        </div>
      )}
    </li>
  );
}
