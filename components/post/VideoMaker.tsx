"use client";

import { useRef, useState } from "react";

// Track B1 (client-light video): turn the carousel slides into a short slideshow
// MP4/WebM entirely in the browser — Ken Burns zoom + crossfade on a canvas,
// captured via MediaRecorder. No server render. Outputs 9:16 or 1:1.

const ASPECTS = {
  "9:16": { w: 1080, h: 1920, label: "Dọc 9:16" },
  "1:1": { w: 1080, h: 1080, label: "Vuông 1:1" },
} as const;
type AspectKey = keyof typeof ASPECTS;

function pickMime(): { mime: string; ext: string } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const cands = ["video/mp4;codecs=h264", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  for (const m of cands) if (MediaRecorder.isTypeSupported(m)) return { mime: m, ext: m.startsWith("video/mp4") ? "mp4" : "webm" };
  return null;
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không tải được ảnh"));
    img.src = src;
  });
}

// Draw an image scaled to cover/contain the canvas, multiplied by `scale` (zoom).
function drawFit(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number, mode: "cover" | "contain", scale: number) {
  const base = mode === "cover" ? Math.max(W / img.width, H / img.height) : Math.min(W / img.width, H / img.height);
  const s = base * scale;
  const dw = img.width * s, dh = img.height * s;
  ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
}

// One slide: blurred cover background (fills any letterbox) + sharp contained
// image, both at the given zoom and alpha.
function drawSlide(ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number, zoom: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = "blur(26px)";
  drawFit(ctx, img, W, H, "cover", zoom * 1.08);
  ctx.filter = "none";
  drawFit(ctx, img, W, H, "contain", zoom);
  ctx.restore();
}

export function VideoMaker({ images, postId }: { images: string[]; postId: string }) {
  const [aspect, setAspect] = useState<AspectKey>("9:16");
  const [perSlide, setPerSlide] = useState(2.5);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [ext, setExt] = useState("webm");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (images.length === 0) {
    return (
      <p className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
        Chưa có ảnh để dựng video. Thiết lập Thương hiệu (tên + SĐT) để hệ thống tạo slide trước.
      </p>
    );
  }

  async function make() {
    setError(null);
    setUrl(null);
    setBusy(true);
    setProgress(0);
    try {
      const picked = pickMime();
      if (!picked) throw new Error("Trình duyệt không hỗ trợ tạo video. Hãy dùng Chrome trên máy tính.");
      const imgs = await Promise.all(images.map(loadImg));
      const { w, h } = ASPECTS[aspect];
      const canvas = canvasRef.current!;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      // Prime the first frame before capturing so the video opens on slide 1.
      ctx.fillStyle = "#05070d";
      ctx.fillRect(0, 0, w, h);
      drawSlide(ctx, imgs[0], w, h, 1.02, 1);

      const fps = 30, fade = 0.5;
      const stream = canvas.captureStream(fps);
      const rec = new MediaRecorder(stream, { mimeType: picked.mime, videoBitsPerSecond: 6_000_000 });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise<void>((resolve) => { rec.onstop = () => resolve(); });
      rec.start();

      const total = imgs.length * perSlide;
      const start = performance.now();
      await new Promise<void>((resolve) => {
        function frame(now: number) {
          const t = (now - start) / 1000;
          if (t >= total) { resolve(); return; }
          const idx = Math.min(imgs.length - 1, Math.floor(t / perSlide));
          const local = t - idx * perSlide;
          ctx.fillStyle = "#05070d";
          ctx.fillRect(0, 0, w, h);
          drawSlide(ctx, imgs[idx], w, h, 1.02 + 0.06 * (local / perSlide), 1);
          if (idx < imgs.length - 1 && local > perSlide - fade) {
            drawSlide(ctx, imgs[idx + 1], w, h, 1.02, (local - (perSlide - fade)) / fade);
          }
          setProgress(Math.round((t / total) * 100));
          requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });

      rec.stop();
      await stopped;
      const blob = new Blob(chunks, { type: picked.mime });
      setUrl(URL.createObjectURL(blob));
      setExt(picked.ext);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi tạo video");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Dựng video slideshow ({images.length} slide) ngay trên trình duyệt — không cần tải lên đâu cả. Tốt nhất trên Chrome máy tính.
      </p>

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex gap-1">
          {(Object.keys(ASPECTS) as AspectKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setAspect(k)}
              disabled={busy}
              className={`rounded-full px-3 py-1 transition ${aspect === k ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
            >
              {ASPECTS[k].label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-muted-foreground">
          Mỗi slide
          <select
            value={perSlide}
            onChange={(e) => setPerSlide(Number(e.target.value))}
            disabled={busy}
            className="rounded-md border border-border bg-background px-2 py-1 text-foreground"
          >
            <option value={2}>2s</option>
            <option value={2.5}>2.5s</option>
            <option value={3}>3s</option>
          </select>
        </label>
        <button
          type="button"
          onClick={make}
          disabled={busy}
          className="rounded-md bg-primary px-4 py-1.5 font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? `Đang dựng… ${progress}%` : "🎬 Tạo video"}
        </button>
      </div>

      {busy && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-brand transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

      {url && (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={url} controls playsInline className="mx-auto max-h-[70vh] w-auto rounded-lg border border-border bg-black" />
          <a href={url} download={`video-${postId}.${ext}`} className="self-start rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
            ↓ Tải video ({ext.toUpperCase()})
          </a>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
