"use client";

import { useEffect, useState } from "react";

// Share controls for the public knowledge-map page. Native share sheet (covers
// Zalo/Messenger on mobile) + copy link + Facebook. Sale gửi khách 1 chạm.
export function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
    setCanNative(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };
  const native = async () => {
    try { await navigator.share({ title, text: `Bản đồ tri thức dự án ${title}`, url }); } catch { /* user cancelled */ }
  };
  const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canNative && (
        <button onClick={native} className="rounded-lg bg-sky-500 px-3 py-1.5 text-sm text-white hover:bg-sky-600">📤 Chia sẻ</button>
      )}
      <button onClick={copy} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">{copied ? "✓ Đã copy link" : "🔗 Copy link"}</button>
      <a href={fb} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted">f Facebook</a>
    </div>
  );
}
