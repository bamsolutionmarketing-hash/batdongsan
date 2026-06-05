import Link from "next/link";

export interface SetView { urls: string[]; placeholder: boolean }

// Renders an assembled image set: a swipeable carousel strip (one card per
// slide, numbered, per-slide download) or a single collage image. Read-only.
export function ImageSetView({ kind, set }: { kind: "carousel" | "collage" | "facts"; set: SetView | null }) {
  if (!set || set.urls.length === 0) {
    return (
      <p className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
        {kind === "facts" ? (
          <>Các điểm chưa có số liệu để dựng thẻ. Thêm dữ kiện (facts) cho node, hoặc thiết lập{" "}
            <Link href="/settings" className="text-brand underline">Thương hiệu</Link>.</>
        ) : (
          <>Chưa tạo được bộ ảnh. Thiết lập{" "}
            <Link href="/settings" className="text-brand underline">Thương hiệu</Link>{" "}
            (tên + SĐT){kind === "collage" ? " và chọn ≥2 điểm" : ""} trước.</>
        )}
      </p>
    );
  }

  if (kind === "collage") {
    const url = set.urls[0];
    return (
      <figure className="overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Ảnh ghép" className="w-full" />
        </a>
        <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            {set.placeholder ? "Có ảnh mẫu — thay bằng ảnh thật ở Dự án" : "Ảnh ghép 1080×1080"}
          </span>
          <a href={url} download className="rounded bg-primary px-2.5 py-1 font-medium text-primary-foreground transition hover:bg-primary/90">↓ Tải</a>
        </figcaption>
      </figure>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        {set.urls.length} slide — lưu từng ảnh rồi đăng dạng “nhiều ảnh”.{set.placeholder ? " Một số là ảnh mẫu." : ""}
      </p>
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {set.urls.map((u, i) => (
          <div key={u} className="relative w-44 shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-card shadow-card">
            <a href={u} target="_blank" rel="noopener noreferrer" className="block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt={`Slide ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
            </a>
            <span className="absolute left-1.5 top-1.5 rounded bg-background/70 px-1.5 py-0.5 text-[10px] font-medium text-foreground">{i + 1}/{set.urls.length}</span>
            <a href={u} download className="block bg-primary py-1 text-center text-[11px] font-medium text-primary-foreground transition hover:bg-primary/90">↓ Tải</a>
          </div>
        ))}
      </div>
    </div>
  );
}
