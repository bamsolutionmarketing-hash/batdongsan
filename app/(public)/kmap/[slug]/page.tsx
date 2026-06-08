import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/repo/projects";
import { getDeveloper } from "@/lib/repo/developers";
import { nodesByProject, linksByProject } from "@/lib/repo/nodes";
import { buildGraph } from "@/lib/map/buildGraph";
import { compactVnd } from "@/lib/finance/format";
import { ProjectKnowledgeMap } from "@/components/map/ProjectKnowledgeMap";

// Public, free, read-only knowledge map. Anyone can browse a published project's
// info (facts + description + relationship graph). The sale-only talkpoints are
// stripped, and content generation stays behind login (CTA below).
export const dynamic = "force-dynamic";

async function load(slug: string) {
  const res = await getProjectBySlug(slug);
  if (!res.ok || !res.data || !res.data.isPublished) return null;
  return res.data;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await load(params.slug);
  if (!project) return { title: "Bản đồ tri thức dự án" };
  return {
    title: `${project.name} — Bản đồ tri thức dự án`,
    description: `Thông tin dự án ${project.name}${project.locationText ? ` tại ${project.locationText}` : ""}: pháp lý, sản phẩm, tiện ích, hạ tầng, so sánh — xem miễn phí.`,
  };
}

export default async function PublicKmapPage({ params }: { params: { slug: string } }) {
  const project = await load(params.slug);
  if (!project) notFound();

  const [devRes, nodesRes, linksRes] = await Promise.all([
    getDeveloper(project.developerId),
    nodesByProject(project.id),
    linksByProject(project.id),
  ]);
  const developer = devRes.ok ? devRes.data : null;
  const nodes = nodesRes.ok ? nodesRes.data : [];
  const links = linksRes.ok ? linksRes.data : [];
  // Public map: hide the sale-only talkpoint coaching.
  const { graph, notesById } = buildGraph(nodes, links, { includeTalkpoint: false });

  const priceLine =
    project.priceMin && project.priceMax
      ? `${compactVnd(project.priceMin)}–${compactVnd(project.priceMax)}/m²`
      : null;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 p-4 sm:p-6">
      <Link href="/kmap" className="text-sm text-muted-foreground hover:text-foreground">← Tất cả dự án</Link>

      <header className="flex flex-col gap-1.5">
        <div className="text-[11px] uppercase tracking-wider text-sky-500">📍 Bản đồ tri thức · xem miễn phí</div>
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          {developer && `${developer.name} · `}{project.locationText}
        </p>
        <div className="mt-1 flex flex-wrap gap-2 text-xs">
          {project.phase && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-amber-500">{project.phase}</span>}
          {priceLine && <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-sky-500">{priceLine}</span>}
          <span className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground">{nodes.length} chủ đề · {links.length} liên kết</span>
        </div>
      </header>

      <ProjectKnowledgeMap data={graph} notesById={notesById} />

      <p className="text-[11px] leading-snug text-muted-foreground">
        Thông tin tổng hợp phục vụ tham khảo, không thay thế hồ sơ pháp lý chính thức của chủ đầu tư.
        Các số liệu về giá/tiến độ có thể thay đổi — đề nghị đối chiếu bảng giá &amp; văn bản có ngày hiệu lực.
      </p>

      {/* CTA: content generation is gated behind login */}
      <div className="rounded-2xl border border-sky-500/30 bg-sky-500/5 p-5 text-center">
        <h2 className="text-base font-semibold text-foreground">Muốn biến bản đồ này thành bài đăng &amp; kịch bản bán hàng?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Xem thông tin thì miễn phí. Đăng nhập để tạo content có thương hiệu, kịch bản tư vấn và công cụ tài chính.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link href={`/login?redirect=/projects/${project.slug}`} className="rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-600">Đăng nhập để tạo content</Link>
          <Link href="/signup" className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-accent">Đăng ký miễn phí</Link>
        </div>
      </div>
    </main>
  );
}
