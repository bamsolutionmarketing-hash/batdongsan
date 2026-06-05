import Link from "next/link";
import { downloadStory } from "@/app/(app)/projects/_actions";

export interface BrandedImg { url: string; nodeId: string; placeholder?: boolean }

// Branded feed images with per-node label, placeholder badge, full preview, and
// feed/story downloads (story 9:16 via server action).
export function BrandedImageGrid({
  images, labels = {}, postId, slug,
}: {
  images: BrandedImg[];
  labels?: Record<string, string>;
  postId: string;
  slug: string;
}) {
  if (images.length === 0) {
    return (
      <p className="rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-500">
        Chưa có ảnh. Thiết lập <Link href="/settings" className="text-sky-400 underline">Thương hiệu</Link> (tên + SĐT + logo)
        để hệ thống tự tạo ảnh đóng logo cho từng điểm.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((im) => (
        <div key={im.nodeId} className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <a href={im.url} target="_blank" rel="noopener noreferrer" className="group relative block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={im.url} alt={labels[im.nodeId] ?? ""} className="aspect-video w-full object-cover transition group-hover:opacity-90" />
            {im.placeholder && (
              <span className="absolute left-1.5 top-1.5 rounded bg-slate-950/70 px-1.5 py-0.5 text-[10px] text-amber-300">ảnh mẫu</span>
            )}
            <span className="absolute inset-0 hidden items-center justify-center bg-slate-950/40 text-xs text-white group-hover:flex">Xem lớn ↗</span>
          </a>
          {labels[im.nodeId] && (
            <p className="truncate px-2 pt-1.5 text-xs font-medium text-slate-200" title={labels[im.nodeId]}>{labels[im.nodeId]}</p>
          )}
          <div className="flex items-center justify-between gap-1 px-2 pb-1.5 pt-1 text-xs">
            <a href={im.url} download className="rounded bg-sky-600/90 px-2 py-0.5 font-medium text-white hover:bg-sky-500">↓ Feed</a>
            <form action={downloadStory}>
              <input type="hidden" name="post_id" value={postId} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="node_id" value={im.nodeId} />
              <button className="rounded border border-slate-700 px-2 py-0.5 text-slate-300 hover:border-slate-500">↓ Story</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
