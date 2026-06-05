"use client";

import { useMemo, useState } from "react";
import { composePrompt } from "@/lib/engine/promptComposer";
import type { ComposeMode, ComposeTone, Fact } from "@/types/domain";

const MODES: { v: ComposeMode; label: string }[] = [
  { v: "fb_post", label: "FB Post" },
  { v: "fb_analysis", label: "Phân tích" },
  { v: "short_caption", label: "Caption ngắn" },
  { v: "zalo_message", label: "Zalo" },
];
const TONES: { v: ComposeTone; label: string }[] = [
  { v: "chuyen_gia", label: "Chuyên gia" },
  { v: "than_thien", label: "Thân thiện" },
  { v: "ke_chuyen", label: "Kể chuyện" },
];

export interface ComposerData {
  project: { name?: string | null; locationText?: string | null };
  nodes: { label: string; facts: Fact[] }[];
  branding: { displayName?: string | null; phone?: string | null; zalo?: string | null };
}

// Caption + copy buttons + mode×tone selector for the AI mega-prompt.
export function CaptionCard({ caption, composer }: { caption: string; composer: ComposerData }) {
  const [mode, setMode] = useState<ComposeMode>("fb_post");
  const [tone, setTone] = useState<ComposeTone>("than_thien");
  const [copied, setCopied] = useState<"" | "caption" | "prompt">("");

  const prompt = useMemo(
    () => composePrompt({ mode, tone, caption, ...composer }),
    [mode, tone, caption, composer],
  );

  const copy = async (text: string, which: "caption" | "prompt") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs ${active ? "bg-sky-600 text-white" : "border border-slate-700 text-slate-300 hover:border-slate-500"}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="whitespace-pre-line rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
        {caption}
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => copy(caption, "caption")} className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500">
          {copied === "caption" ? "✓ Đã copy" : "Copy bài"}
        </button>
        <button onClick={() => copy(prompt, "prompt")} className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500">
          {copied === "prompt" ? "✓ Đã copy" : "Copy kèm prompt AI"}
        </button>
      </div>

      <details className="rounded-md border border-slate-800 bg-slate-950 p-3">
        <summary className="cursor-pointer text-sm text-slate-400">Tùy chọn prompt AI (mode × tone)</summary>
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {MODES.map((m) => (
              <button key={m.v} onClick={() => setMode(m.v)} className={pill(mode === m.v)}>{m.label}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button key={t.v} onClick={() => setTone(t.v)} className={pill(tone === t.v)}>{t.label}</button>
            ))}
          </div>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-slate-900 p-3 text-xs text-slate-300">{prompt}</pre>
        </div>
      </details>
    </div>
  );
}
