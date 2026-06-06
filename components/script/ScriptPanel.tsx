"use client";

import { useMemo, useState, useTransition } from "react";
import { RECIPES } from "@/lib/script-engine/data/recipes";
import type { ScriptResult, Platform, Duration } from "@/lib/script-engine/types";
import { composeScriptPrompt } from "@/lib/engine/promptComposer";
import { generateScriptAction, saveSlotFactsAction, saveMarketFactAction, ingestPerformanceAction } from "@/app/(app)/scripts/_actions";

const PLATFORMS: { v: Platform; label: string }[] = [
  { v: "tiktok", label: "TikTok" },
  { v: "reels", label: "Reels" },
  { v: "shorts", label: "Shorts" },
];
const DURATIONS: Duration[] = [15, 30, 60];

const SLOT_LABEL: Record<string, string> = {
  loai_hinh: "Loại hình (căn hộ/nhà phố…)", loai_can: "Loại căn (2PN 68m²…)", dien_tich: "Diện tích (m²)",
  view: "View", so_tang: "Số tầng", ban_giao: "Bàn giao (YYYY-MM-DD)", phap_ly: "Pháp lý",
  chinh_sach: "Chính sách", so_can_con_lai: "Số căn còn lại", ngan_sach: "Ngân sách KH", thu_nhap: "Thu nhập KH",
  nguon: "Nguồn số liệu", so_lieu: "Số liệu", moc_so_sanh: "Mốc so sánh", su_kien: "Sự kiện",
};
const labelFor = (k: string) => SLOT_LABEL[k] ?? k.replace(/_/g, " ");

const pill = (active: boolean) =>
  `rounded-full px-3 py-1 text-xs transition ${active ? "bg-primary text-primary-foreground" : "border border-border text-foreground hover:border-foreground/30"}`;

export function ScriptPanel({ projectId, nodeIds, projectName }: { projectId: string; nodeIds?: string[]; projectName?: string }) {
  const [platform, setPlatform] = useState<Platform>("tiktok");
  const [durationS, setDurationS] = useState<Duration>(30);
  const [contentType, setContentType] = useState<string>("CT-01");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [missing, setMissing] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState("");
  const [pending, start] = useTransition();

  const run = (a: number, ct = contentType) =>
    start(async () => {
      const r = await generateScriptAction({ projectId, platform, durationS, contentType: ct, attempt: a, nodeIds });
      setResult(r);
      setAttempt(a);
      if (r.status === "MISSING_SLOTS") setMissing(Object.fromEntries((r.missingSlots ?? []).map((k) => [k, ""])));
    });

  const fillAndRetry = () =>
    start(async () => {
      const entries = Object.entries(missing).map(([key, value]) => ({ key, value }));
      await saveSlotFactsAction(projectId, entries);
      const r = await generateScriptAction({ projectId, platform, durationS, contentType, attempt, nodeIds });
      setResult(r);
      if (r.status === "MISSING_SLOTS") setMissing(Object.fromEntries((r.missingSlots ?? []).map((k) => [k, ""])));
    });

  const copy = (text: string, which: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(""), 1500);
    });
  };

  const scriptText = result?.script
    ? result.script.map((l) => `[${l.start}-${l.end}s] HÌNH: ${l.visual}\nTIẾNG: ${l.speech}\nOVERLAY: ${l.overlay}`).join("\n\n")
    : "";

  // Wrap the whole script into a self-contained AI prompt (for an external
  // generative-AI app), mirroring the post's "Copy kèm prompt AI".
  const aiPrompt = useMemo(
    () =>
      result?.status === "OK" && result.script
        ? composeScriptPrompt({
            platform, durationS,
            contentTypeName: RECIPES.find((r) => r.id === contentType)?.nameVi,
            projectName,
            script: result.script,
            caption: result.caption,
            checklist: result.checklist,
          })
        : "",
    [result, platform, durationS, contentType, projectName],
  );

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">🎬 Kịch bản video (lắp ráp tự động)</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Chọn dạng × kênh × độ dài → kịch bản 2 cột (HÌNH | TIẾNG), caption + hashtag, checklist quay. Bám dữ liệu đã xác thực, không hứa lợi nhuận.
        </p>
      </div>

      {nodeIds && nodeIds.length > 0 && (
        <p className="rounded-md border border-sky-700/50 bg-sky-950/30 px-3 py-2 text-xs text-sky-300">
          Bám theo {nodeIds.length} điểm tri thức đã chọn — mỗi đoạn nội dung sẽ theo chủ đề một điểm. Số điểm cần khớp số đoạn của độ dài (đổi độ dài nếu lệch).
        </p>
      )}

      {/* controls */}
      <div className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Dạng nội dung
          <select value={contentType} onChange={(e) => setContentType(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground">
            {RECIPES.map((r) => <option key={r.id} value={r.id}>{r.nameVi}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => <button key={p.v} onClick={() => setPlatform(p.v)} className={pill(platform === p.v)}>{p.label}</button>)}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DURATIONS.map((d) => <button key={d} onClick={() => setDurationS(d)} className={pill(durationS === d)}>{d}s</button>)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => run(0)} disabled={pending} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {pending ? "Đang lắp…" : "Tạo kịch bản"}
        </button>
        {result?.status === "OK" && (
          <>
            <button onClick={() => run(attempt + 1)} disabled={pending} className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/30">Đổi hook</button>
            <button onClick={() => copy(scriptText, "script")} className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/30">{copied === "script" ? "✓ Đã copy" : "Copy kịch bản"}</button>
            <button onClick={() => copy(aiPrompt, "prompt")} className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:border-foreground/30">{copied === "prompt" ? "✓ Đã copy" : "Copy kèm prompt AI"}</button>
          </>
        )}
      </div>

      {/* MISSING SLOTS form */}
      {result?.status === "MISSING_SLOTS" && (
        <div className="rounded-md border border-amber-700/50 bg-amber-950/20 p-3">
          <p className="text-sm text-amber-300">Thiếu dữ liệu để lắp hook tốt nhất. Điền nhanh rồi tạo lại:</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.keys(missing).map((k) => (
              <label key={k} className="flex flex-col gap-1 text-xs text-muted-foreground">
                {labelFor(k)}
                <input value={missing[k]} onChange={(e) => setMissing({ ...missing, [k]: e.target.value })} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
              </label>
            ))}
          </div>
          <button onClick={fillAndRetry} disabled={pending} className="mt-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Lưu & tạo lại</button>
        </div>
      )}

      {/* lint banner */}
      {result?.lint && result.lint.hardBlocks.length > 0 && (
        <div className="rounded-md border border-red-800/60 bg-red-950/30 p-3 text-sm text-red-300">
          ⛔ Bị chặn (R10): {result.lint.hardBlocks.map((h) => h.message).join(" · ")}
        </div>
      )}
      {result?.lint && result.lint.warnings.length > 0 && (
        <div className="rounded-md border border-amber-700/50 bg-amber-950/20 p-2 text-xs text-amber-300">
          ⚠ {result.lint.warnings.map((w) => `${w.match} (${w.message})`).join(" · ")}
        </div>
      )}

      {/* two-column script */}
      {result?.script && result.script.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted text-muted-foreground">
              <tr><th className="p-2">⏱</th><th className="p-2">🎬 HÌNH</th><th className="p-2">🎤 TIẾNG</th><th className="p-2">📝 OVERLAY</th></tr>
            </thead>
            <tbody>
              {result.script.map((l, i) => (
                <tr key={i} className="border-t border-border align-top">
                  <td className="whitespace-nowrap p-2 text-muted-foreground">{l.start}–{l.end}s</td>
                  <td className="p-2 text-foreground">{l.visual}</td>
                  <td className="p-2 text-foreground">{l.speech}</td>
                  <td className="p-2 text-sky-300">{l.overlay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* caption + shotlist */}
      {result?.caption && (
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Caption</span>
            <button onClick={() => copy(`${result.caption!.text}\n${result.caption!.hashtags.join(" ")}`, "cap")} className="text-xs text-sky-400">{copied === "cap" ? "✓" : "Copy"}</button>
          </div>
          <p className="mt-1 whitespace-pre-line text-foreground">{result.caption.text}</p>
          <p className="mt-1 text-sky-400">{result.caption.hashtags.join(" ")}</p>
        </div>
      )}
      {result?.checklist && result.checklist.length > 0 && (
        <details className="rounded-md border border-border bg-background p-3">
          <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-foreground">Checklist quay</summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs text-foreground">{result.checklist.join("\n")}</pre>
        </details>
      )}

      {/* AI prompt preview */}
      {result?.status === "OK" && aiPrompt && (
        <details className="rounded-md border border-border bg-background p-3">
          <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-foreground">Prompt AI (gói toàn bộ kịch bản để dán sang app AI khác)</summary>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-card p-3 text-xs text-foreground">{aiPrompt}</pre>
        </details>
      )}

      {/* A/B alternate hook */}
      {result?.altHook && (
        <div className="rounded-md border border-border bg-background p-3 text-sm">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Hook A/B thay thế ({result.altHook.id})</span>
          <p className="mt-1 text-foreground">🎤 {result.altHook.text}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Quay thêm bản này để test 2 hook trên cùng nội dung.</p>
        </div>
      )}

      {/* performance ingest (P5) */}
      {result?.meta?.scriptId && <PerfForm scriptId={result.meta.scriptId} platform={platform} />}

      <MarketFactQuickForm khuVuc="" />
    </div>
  );
}

// Manual performance entry → feeds EWMA template weighting (P5).
function PerfForm({ scriptId, platform }: { scriptId: string; platform: Platform }) {
  const [views, setViews] = useState("");
  const [retention3s, setR3] = useState("");
  const [completion, setCompletion] = useState("");
  const [leads, setLeads] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const num = (s: string) => (s.trim() === "" ? undefined : Number(s));
  const save = () =>
    start(async () => {
      const r = await ingestPerformanceAction(scriptId, {
        platform, views: num(views), retention3s: num(retention3s), completion: num(completion), leads: num(leads),
      });
      setMsg(r.ok ? "✓ Đã ghi nhận — hook/recipe tốt sẽ được ưu tiên lần sau" : r.error ?? "Lỗi");
    });
  return (
    <details className="rounded-md border border-border bg-background p-3">
      <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-foreground">+ Nhập hiệu suất video (P5 — nuôi gợi ý)</summary>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <input placeholder="Views" value={views} onChange={(e) => setViews(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
        <input placeholder="Giữ 3s (0-1)" value={retention3s} onChange={(e) => setR3(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
        <input placeholder="Hoàn tất (0-1)" value={completion} onChange={(e) => setCompletion(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
        <input placeholder="Leads" value={leads} onChange={(e) => setLeads(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={save} disabled={pending} className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-foreground/30 disabled:opacity-50">Ghi nhận</button>
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
      </div>
    </details>
  );
}

// Compact form to add a sourced market datum so DAT/FOMO hooks can resolve (R5).
function MarketFactQuickForm({ khuVuc }: { khuVuc: string }) {
  const [key, setKey] = useState("so_lieu");
  const [value, setValue] = useState("");
  const [source, setSource] = useState("");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const save = () =>
    start(async () => {
      const r = await saveMarketFactAction({ khuVuc, key, value, source });
      setMsg(r.ok ? "✓ Đã lưu số liệu" : r.error ?? "Lỗi");
      if (r.ok) setValue("");
    });
  return (
    <details className="rounded-md border border-border bg-background p-3">
      <summary className="cursor-pointer text-xs uppercase tracking-wide text-muted-foreground">+ Số liệu thị trường (mở khoá hook số liệu/FOMO)</summary>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <select value={key} onChange={(e) => setKey(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground">
          {["so_lieu", "ty_le_tang_gia", "lai_suat", "moc_so_sanh", "su_kien", "nguon"].map((k) => <option key={k} value={k}>{labelFor(k)}</option>)}
        </select>
        <input placeholder="Giá trị" value={value} onChange={(e) => setValue(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground" />
        <input placeholder="Nguồn (bắt buộc)" value={source} onChange={(e) => setSource(e.target.value)} className="rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground sm:col-span-2" />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={save} disabled={pending} className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:border-foreground/30 disabled:opacity-50">Lưu</button>
        {msg && <span className="text-xs text-muted-foreground">{msg}</span>}
      </div>
    </details>
  );
}
