"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { uploadDocument, type IngestState } from "./actions";

const initial: IngestState = {};

export function UploadForm({ projects }: { projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<IngestState>(initial);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState(initial);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await uploadDocument(initial, formData);
      setState(res);
      if (res.documentId && !res.error) {
        router.push(`/app/ingest/${res.documentId}`);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Gắn vào dự án
        <select
          name="projectId"
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm outline-none focus:border-sky-500"
        >
          <option value="">— Chưa gắn (chỉ trích xuất) —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Tệp (PDF / DOCX)
        <input
          type="file"
          name="file"
          accept=".pdf,.docx,.txt,application/pdf"
          required
          className="rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-2 file:py-1 file:text-slate-200"
        />
      </label>

      {state.error && <p className="text-sm text-red-400">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {pending ? "Đang tải lên & trích xuất…" : "Tải lên & trích xuất"}
      </button>
    </form>
  );
}
