"use client";

import { useMemo, useState } from "react";
import { composePrompt } from "@/lib/engine/promptComposer";
import { saveCaption } from "@/app/(app)/projects/_actions";
import type { EditableSlot, EditableOption } from "@/lib/engine/assembly";
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

interface Line {
  uid: number;
  role: string;
  nodeLabel: string | null;
  options: EditableOption[];
  optIndex: number;
  custom: string | null; // manual edit overrides the option text
}

const lineText = (l: Line) => l.custom ?? l.options[l.optIndex]?.text ?? "";

// Interactive caption builder: cycle variants, edit text, add/remove/reorder
// paragraphs; the assembled caption updates live.
export function CaptionEditor({
  slots, addable, composer, postId, slug,
}: {
  slots: EditableSlot[];
  addable: EditableSlot[];
  composer: ComposerData;
  postId: string;
  slug: string;
}) {
  let nextUid = slots.length;
  const [lines, setLines] = useState<Line[]>(
    () => slots.map((s, i) => ({ uid: i, role: s.role, nodeLabel: s.nodeLabel, options: s.options, optIndex: s.selectedIndex, custom: null })),
  );
  const [editing, setEditing] = useState<number | null>(null);
  const [addKey, setAddKey] = useState<string>(addable[0]?.key ?? "");
  const [mode, setMode] = useState<ComposeMode>("fb_post");
  const [tone, setTone] = useState<ComposeTone>("than_thien");
  const [copied, setCopied] = useState<"" | "caption" | "prompt">("");

  const caption = useMemo(() => lines.map(lineText).filter(Boolean).join("\n\n"), [lines]);
  const prompt = useMemo(() => composePrompt({ mode, tone, caption, ...composer }), [mode, tone, caption, composer]);

  const update = (uid: number, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.uid === uid ? { ...l, ...patch } : l)));
  const cycle = (l: Line, dir: 1 | -1) =>
    update(l.uid, { optIndex: (l.optIndex + dir + l.options.length) % l.options.length, custom: null });
  const remove = (uid: number) => setLines((ls) => ls.filter((l) => l.uid !== uid));
  const move = (i: number, dir: 1 | -1) =>
    setLines((ls) => {
      const j = i + dir;
      if (j < 0 || j >= ls.length) return ls;
      const next = [...ls];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const add = () => {
    const g = addable.find((a) => a.key === addKey);
    if (!g) return;
    setLines((ls) => [...ls, { uid: nextUid++, role: g.role, nodeLabel: g.nodeLabel, options: g.options, optIndex: 0, custom: null }]);
  };

  const copy = async (text: string, which: "caption" | "prompt") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    } catch { /* clipboard unavailable */ }
  };

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs ${active ? "bg-sky-600 text-white" : "border border-slate-700 text-slate-300 hover:border-slate-500"}`;
  const ctl = "inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded border border-slate-700 px-2 text-base text-slate-300 hover:border-slate-500 disabled:opacity-30";

  return (
    <div className="flex flex-col gap-4">
      {/* Per-slot editor */}
      <div className="flex flex-col gap-2">
        {lines.map((l, i) => {
          const opt = l.options[l.optIndex];
          const many = l.options.length > 1;
          const isEditing = editing === l.uid;
          return (
            <div key={l.uid} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-slate-500">
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-300">{ROLE_LABEL[l.role] ?? l.role}</span>
                {l.nodeLabel && <span>· {l.nodeLabel}</span>}
                {!l.custom && <span className="text-slate-600">· {TONE_LABEL[opt?.tone] ?? opt?.tone}</span>}
                {l.custom != null && <span className="text-amber-500/70">· đã sửa tay</span>}
                <div className="ml-auto flex items-center gap-1.5">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={ctl} aria-label="Lên">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === lines.length - 1} className={ctl} aria-label="Xuống">↓</button>
                  <button type="button" onClick={() => cycle(l, -1)} disabled={!many} className={ctl} aria-label="Mẫu trước">‹</button>
                  <span className="tabular-nums text-slate-400">{l.optIndex + 1}/{l.options.length}</span>
                  <button type="button" onClick={() => cycle(l, 1)} disabled={!many} className={ctl} aria-label="Mẫu sau">›</button>
                  <button
                    type="button"
                    onClick={() => { setEditing(isEditing ? null : l.uid); if (!isEditing && l.custom == null) update(l.uid, { custom: lineText(l) }); }}
                    className={`${ctl} ${isEditing ? "border-sky-600 text-sky-400" : ""}`}
                    aria-label="Sửa"
                  >✎</button>
                  <button type="button" onClick={() => remove(l.uid)} disabled={lines.length <= 1} className={`${ctl} hover:border-red-500 hover:text-red-400`} aria-label="Xóa">✕</button>
                </div>
              </div>
              {isEditing ? (
                <textarea
                  value={l.custom ?? ""}
                  onChange={(e) => update(l.uid, { custom: e.target.value })}
                  rows={3}
                  className="w-full rounded border border-sky-900/60 bg-slate-950 p-2 text-sm leading-relaxed text-slate-100 outline-none focus:border-sky-600"
                />
              ) : (
                <p className="text-sm leading-relaxed text-slate-100">{lineText(l)}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add a paragraph */}
      {addable.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-md border border-dashed border-slate-800 p-2">
          <span className="text-xs text-slate-500">Thêm đoạn:</span>
          <select value={addKey} onChange={(e) => setAddKey(e.target.value)} className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-200">
            {addable.map((a) => (
              <option key={a.key} value={a.key}>{(ROLE_LABEL[a.role] ?? a.role)}{a.nodeLabel ? ` · ${a.nodeLabel}` : ""}</option>
            ))}
          </select>
          <button type="button" onClick={add} className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-slate-500">+ Thêm</button>
        </div>
      )}

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
