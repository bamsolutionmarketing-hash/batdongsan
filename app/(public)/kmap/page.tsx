import Link from "next/link";
import type { Metadata } from "next";
import { listPublishedProjects } from "@/lib/repo/projects";

// Public index of free, read-only project knowledge maps.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bản đồ tri thức dự án — xem miễn phí",
  description: "Khám phá thông tin các dự án bất động sản: pháp lý, sản phẩm, tiện ích, hạ tầng, so sánh — dưới dạng bản đồ tri thức trực quan.",
};

export default async function KmapIndexPage() {
  const res = await listPublishedProjects();
  const projects = res.ok ? res.data : [];

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex flex-col gap-1.5">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Trang chủ</Link>
        <h1 className="text-2xl font-bold text-foreground">🗺️ Bản đồ tri thức dự án</h1>
        <p className="text-sm text-muted-foreground">Xem thông tin dự án miễn phí. Đăng nhập khi muốn tạo bài đăng &amp; kịch bản bán hàng.</p>
      </header>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có dự án nào được công bố.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/kmap/${p.slug}`} className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-sky-500/50">
                <div className="relative aspect-[16/9] w-full bg-muted">
                  {p.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnailUrl} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-background text-4xl">🏢</div>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-4">
                  <h2 className="font-semibold text-foreground">{p.name}</h2>
                  <p className="text-xs text-muted-foreground">{p.locationText}</p>
                  {p.phase && <p className="text-[11px] text-amber-500/80">{p.phase}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
