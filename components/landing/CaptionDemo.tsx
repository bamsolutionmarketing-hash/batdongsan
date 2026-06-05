"use client";

import { useMemo, useState } from "react";
import { DEMO_MODES, DEMO_TONES, sampleCaption, type DemoMode, type DemoTone } from "@/lib/landing/sample";

// Interactive caption demo: pick mode × tone → the sample caption updates live.
export function CaptionDemo() {
  const [mode, setMode] = useState<DemoMode>("fb_post");
  const [tone, setTone] = useState<DemoTone>("than_thien");
  const [copied, setCopied] = useState(false);
  const caption = useMemo(() => sampleCaption(mode, tone), [mode, tone]);

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs transition ${active ? "bg-sky-600 text-white" : "border border-slate-700 text-slate-300 hover:border-slate-500"}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-xl shadow-slate-950/40 sm:p-6">
      <div className="flex flex-wrap gap-1.5">
        {DEMO_MODES.map((m) => (
          <button key={m.v} onClick={() => setMode(m.v)} className={pill(mode === m.v)}>{m.label}</button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DEMO_TONES.map((t) => (
          <button key={t.v} onClick={() => setTone(t.v)} className={pill(tone === t.v)}>{t.label}</button>
        ))}
      </div>

      <div key={`${mode}-${tone}`} className="mt-4 min-h-[8rem] animate-[lp-fade_0.3s_ease-out] whitespace-pre-line rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100">
        {caption}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button onClick={copy} className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-sky-500">
          {copied ? "✓ Đã copy" : "Copy bài"}
        </button>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
          <span>✓</span> Chỉ dùng số liệu đã xác thực
        </span>
      </div>
    </div>
  );
}
