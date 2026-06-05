"use client";

import { useMemo, useState } from "react";
import { composePrompt } from "@/lib/engine/promptComposer";
import { saveCaption } from "@/app/(app)/projects/_actions";
import type { EditableSlot } from "@/lib/engine/assembly";
import type { ComposerData } from "./CaptionCard";
import type { ComposeMode, ComposeTone } from "@/types/domain";

const ROLE_LABEL: Record<string, string> = {
  hook: "Mở bài", body: "Thân bài", proof: "Bằng chứng", cta: "Kêu gọi",
};
const TONE_LABEL: Record<string, string> = {
  neutral: "trung tính", fomo: "khẩn", story: "kể chuyện",
};
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

// Interactive caption builder: each slot (hook/body/proof/cta) can be cycled
// through its usable variants; the assembled caption updates live.
export function CaptionEditor({
  slots, composer, postId, slug,
}: {
  slots: EditableSlot[];
  composer: ComposerData;
  postId: string;
  slug: string;
}) {
  // selected variant index per slot key
  const [sel, setSel] = useState<Record<string, number>>(
    () => Object.fromEntries(slots.map((s) => [s.key, s.selectedIndex])),
  );
  const [mode, setMode] = useState<ComposeMode>("fb_post");
  const [tone, setTone] = useState<ComposeTone>("than_thien");
  const [copied, setCopied] = useState<"" | "caption" | "prompt">("");

  const caption = useMemo(
    () => slots.map((s) => s.options[sel[s.key] ?? 0]?.text ?? "").filter(Boolean).join("\n\n"),
    [slots, sel],
  );
  const prompt = useMemo(
    () => composePrompt({ mode, tone, caption, ...composer }),
    [mode, tone, caption, composer],
  );

  const cycle = (key: string, len: number, dir: 1 | -1) =>
    setSel((p) => ({ ...p, [key]: ((p[key] ?? 0) + dir + len) % len }));

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
    <div className="flex flex-col gap-4">
      {/* Per-slot variant picker */}
      <div className="flex flex-col gap-2">
        {slots.map((s) => {
          const i = sel[s.key] ?? 0;
          const opt = s.options[i];
          const many = s.options.length > 1;
          return (
            <div key={s.key} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-wide text-slate-500">
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">{ROLE_LABEL[s.role] ?? s.role}</span>
                {s.nodeLabel && <span className="text-slate-500">· {s.nodeLabel}</span>}
                <span className="text-slate-600">· {TONE_LABEL[opt?.tone] ?? opt?.tone}</span>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => cycle(s.key, s.options.length, -1)}
                    disabled={!many}
                    className="rounded border border-slate-700 px-1.5 text-slate-300 hover:border-slate-500 disabled:opacity-30"
                    aria-label="Mẫu trước"
                  >‹</button>
                  <span className="tabular-nums text-slate-400">{i + 1}/{s.options.length}</span>
                  <button
                    type="button"
                    onClick={() => cycle(s.key, s.options.length, 1)}
                    disabled={!many}
                    className="rounded border border-slate-700 px-1.5 text-slate-300 hover:border-slate-500 disabled:opacity-30"
                    aria-label="Mẫu sau"
                  >›</button>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-100">{opt?.text}</p>
            </div>
          );
        })}
      </div>

      {/* Live assembled caption */}
      <div className="whitespace-pre-line rounded-lg border border-sky-900/50 bg-slate-950 p-4 text-sm leading-relaxed text-slate-100">
        {caption}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => copy(caption, "caption")} className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500">
          {copied === "caption" ? "✓ Đã copy" : "Copy bài"}
        </button>
        <button onClick={() => copy(prompt, "prompt")} className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:border-slate-500">
          {copied === "prompt" ? "✓ Đã copy" : "Copy kèm prompt AI"}
        </button>
        <form action={saveCaption} className="ml-auto">
          <input type="hidden" name="post_id" value={postId} />
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="caption" value={caption} />
          <button type="submit" className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500">
            Lưu bản này
          </button>
        </form>
      </div>

      {/* AI prompt (mode × tone) */}
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
