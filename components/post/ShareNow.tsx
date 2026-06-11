"use client";

import { useState } from "react";

// "Đăng ngay" — one-tap publish for a lazy sale on a phone. Uses the device's
// native share sheet (Web Share API L2, files + text), NOT a backend API: no
// Facebook/Zalo login, no app review, works free on personal accounts in the
// PWA. Caption is always copied first because Facebook usually strips
// pre-filled text from a file share. Desktop / unsupported → download images +
// copy caption with guidance.
export function ShareNow({ caption, images, filePrefix = "nhapilot" }: {
  caption: string;
  images: string[];
  filePrefix?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  if (images.length === 0) return null;

  const copyCaption = async () => {
    if (!caption.trim()) return false;
    try { await navigator.clipboard.writeText(caption); return true; } catch { return false; }
  };

  const toFiles = async (): Promise<File[]> => {
    const out: File[] = [];
    for (let i = 0; i < images.length; i++) {
      const r = await fetch(images[i]);
      const b = await r.blob();
      const ext = (b.type || "image/jpeg").includes("png") ? "png" : "jpg";
      out.push(new File([b], `${filePrefix}-${i + 1}.${ext}`, { type: b.type || "image/jpeg" }));
    }
    return out;
  };

  const downloadAll = () => {
    images.forEach((u, i) => {
      const a = document.createElement("a");
      a.href = u; a.download = `${filePrefix}-${i + 1}.jpg`; a.target = "_blank";
      document.body.appendChild(a); a.click(); a.remove();
    });
  };

  const share = async () => {
    setBusy(true); setMsg(null);
    const copied = await copyCaption();
    try {
      let files: File[] = [];
      try { files = await toFiles(); } catch { /* CORS / mạng — rơi xuống fallback */ }

      const canFiles = files.length > 0 && typeof navigator.canShare === "function" && navigator.canShare({ files });
      if (canFiles) {
        await navigator.share({ files, text: caption, title: "Bài đăng bất động sản" });
        setMsg(copied ? "Đã mở khay chia sẻ — caption đã copy sẵn, dán nếu app không tự điền (Facebook hay bỏ chữ)." : "Đã mở khay chia sẻ.");
        return;
      }
      // Khay chia sẻ kèm ảnh không có (thường là desktop) → tải ảnh + copy caption.
      downloadAll();
      setMsg(copied
        ? "Máy không chia sẻ kèm ảnh được — đã tải ảnh về & copy caption. Mở Facebook/Zalo, đăng ảnh rồi dán caption."
        : "Đã tải ảnh về — copy caption ở khung bài rồi đăng kèm.");
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") { setMsg(null); return; } // người dùng huỷ
      downloadAll();
      setMsg("Không mở được khay chia sẻ — đã tải ảnh về, copy caption rồi đăng thủ công.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={share}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {busy ? "Đang chuẩn bị…" : `📤 Đăng ngay (${images.length} ảnh + caption)`}
      </button>
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
    </div>
  );
}
