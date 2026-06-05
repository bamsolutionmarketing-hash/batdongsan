"use client";

import { useState } from "react";

// Read-only caption + copy buttons ("bài" and "kèm prompt AI").
export function CaptionCard({ caption, prompt }: { caption: string; prompt: string }) {
  const [copied, setCopied] = useState<"" | "caption" | "prompt">("");
  const copy = async (text: string, which: "caption" | "prompt") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="whitespace-pre-line rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
        {caption}
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => copy(caption, "caption")}
          className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          {copied === "caption" ? "✓ Đã copy" : "Copy bài"}
        </button>
        <button
          onClick={() => copy(prompt, "prompt")}
          className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
        >
          {copied === "prompt" ? "✓ Đã copy" : "Copy kèm prompt AI"}
        </button>
      </div>
    </div>
  );
}
