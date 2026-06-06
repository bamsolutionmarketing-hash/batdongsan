"use client";

import { useMemo, useState } from "react";
import { composeVideoPrompt } from "@/lib/engine/videoPrompt";
import { SCRIPT_TEMPLATES, DEFAULT_TEMPLATE_ID, getScriptTemplate, type VideoFormat, type VideoLength } from "@/lib/engine/videoTemplates";
import type { ComposeTone } from "@/types/domain";
import type { ComposerData } from "./CaptionCard";

const FORMATS: { v: VideoFormat; label: string }[] = [
  { v: "reel", label: "Reels" },
  { v: "tiktok", label: "TikTok" },
  { v: "short", label: "YT Shorts" },
];
const LENGTHS: { v: VideoLength; label: string }[] = [
  { v: 15, label: "15s" },
  { v: 30, label: "30s" },
  { v: 60, label: "60s" },
];
const TONES: { v: ComposeTone; label: string }[] = [
  { v: "than_thien", label: "Thân thiện" },
  { v: "chuyen_gia", label: "Chuyên gia" },
  { v: "ke_chuyen", label: "Kể chuyện" },
];

// Rule-based video-SCRIPT prompt builder: picks format × length × tone, composes
// a copy-paste brief the agent feeds to GPT/Claude to get a ready storyboard.
// No AI runs here — same pattern as the post mega-prompt.
export function VideoScriptCard({ caption, composer }: { caption: string; composer: ComposerData }) {
  const [template, setTemplate] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [format, setFormat] = useState<VideoFormat>("reel");
  const [length, setLength] = useState<VideoLength>(30);
  const [tone, setTone] = useState<ComposeTone>("than_thien");
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => composeVideoPrompt({ template, format, length, tone, caption, ...composer }),
    [template, format, length, tone, caption, composer],
  );
  const tplDesc = getScriptTemplate(template).desc;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs transition ${active ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-foreground/30"}`;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">🎬 Kịch bản video (prompt cho AI)</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Chọn kênh × độ dài × giọng, bấm copy rồi dán sang ChatGPT/Claude — nhận kịch bản quay (hook 3 giây, storyboard từng cảnh, CTA, hashtag). Bám đúng dữ liệu đã xác thực.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Dạng kịch bản
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
          >
            {SCRIPT_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <span className="text-[11px] text-muted-foreground">{tplDesc}</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FORMATS.map((f) => (
            <button key={f.v} onClick={() => setFormat(f.v)} className={pill(format === f.v)}>{f.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LENGTHS.map((l) => (
            <button key={l.v} onClick={() => setLength(l.v)} className={pill(length === l.v)}>{l.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TONES.map((t) => (
            <button key={t.v} onClick={() => setTone(t.v)} className={pill(tone === t.v)}>{t.label}</button>
          ))}
        </div>
      </div>

      <button onClick={copy} className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
        {copied ? "✓ Đã copy prompt" : "Copy prompt kịch bản"}
      </button>

      <details className="rounded-md border border-border bg-background p-3">
        <summary className="cursor-pointer text-sm text-muted-foreground">Xem trước prompt</summary>
        <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded bg-card p-3 text-xs text-foreground">{prompt}</pre>
      </details>
    </div>
  );
}
