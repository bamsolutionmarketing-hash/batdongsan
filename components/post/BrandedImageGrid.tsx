import { downloadStory } from "@/app/(app)/projects/_actions";

export interface BrandedImg { url: string; nodeId: string }

// Branded feed images + per-image download; story 9:16 via server action.
export function BrandedImageGrid({
  images, postId, slug,
}: {
  images: BrandedImg[];
  postId: string;
  slug: string;
}) {
  if (images.length === 0) {
    return (
      <p className="rounded-md border border-slate-800 bg-slate-900 p-3 text-xs text-slate-500">
        Chưa có ảnh đóng logo. Cần (1) thiết lập Thương hiệu và (2) admin tải ảnh cho các điểm.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {images.map((im) => (
        <div key={im.nodeId} className="overflow-hidden rounded-md border border-slate-800 bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={im.url} alt="" className="aspect-video w-full object-cover" />
          <div className="flex items-center justify-between gap-1 px-2 py-1 text-xs">
            <a href={im.url} download className="text-sky-400 hover:text-sky-300">Tải ảnh</a>
            <form action={downloadStory}>
              <input type="hidden" name="post_id" value={postId} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="node_id" value={im.nodeId} />
              <button className="text-slate-400 hover:text-slate-200">Story 9:16</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
