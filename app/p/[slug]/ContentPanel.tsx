"use client";

import { useState, useTransition } from "react";
import { generateForProject, type ContentState } from "./content-actions";
import type { ContentFormat } from "@/lib/sales/content";

const FORMAT_LABEL: Record<ContentFormat, string> = {
  facebook_post: "Bài đăng Facebook",
  short_caption: "Caption ngắn",
};

export function ContentPanel({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<ContentState>({});
  const [copied, setCopied] = useState(false);

  function gen(format: ContentFormat) {
    setCopied(false);
    setState({});
    startTransition(async () => {
      setState(await generateForProject(format, slug));
    });
  }

  async function copy() {
    if (!state.result?.body) return;
    await navigator.clipboard.writeText(state.result.body);
    setCopied(true);
  }

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Tạo nội dung đăng bài
      </h2>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(FORMAT_LABEL) as ContentFormat[]).map((f) => (
          <button
            key={f}
            onClick={() => gen(f)}
            disabled={pending}
            className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {pending ? "Đang tạo…" : FORMAT_LABEL[f]}
          </button>
        ))}
      </div>

      {state.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}

      {state.result && (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
          {state.result.missingSlots.length > 0 && (
            <p className="mb-2 rounded bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
              Thiếu dữ liệu: {state.result.missingSlots.join(", ")}. Bổ sung để nội dung đầy đủ hơn.
            </p>
          )}
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-100">
            {state.result.body || "(Chưa đủ dữ kiện để tạo nội dung.)"}
          </pre>
          {state.result.body && (
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={copy}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-xs text-slate-200 hover:border-slate-400"
              >
                {copied ? "Đã copy ✓" : "Copy"}
              </button>
              {state.result.usedFacts.length > 0 && (
                <span className="text-xs text-slate-500">
                  Dựa trên: {state.result.usedFacts.join(" · ")}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
