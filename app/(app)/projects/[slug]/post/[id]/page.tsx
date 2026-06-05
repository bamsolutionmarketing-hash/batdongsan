import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/repo/posts";
import { nodesByIds, linksByProject } from "@/lib/repo/nodes";
import { getProjectById } from "@/lib/repo/projects";
import { getBranding } from "@/lib/repo/branding";
import { getActiveTier } from "@/lib/gate/tier";
import { getBrandedImages } from "@/lib/branding/pipeline";
import { getSession } from "@/lib/auth";
import { getEditableComposition } from "@/lib/post/editable";
import { CaptionCard } from "@/components/post/CaptionCard";
import { CaptionEditor } from "@/components/post/CaptionEditor";
import { BrandedImageGrid } from "@/components/post/BrandedImageGrid";
import { Button } from "@/components/ui/button";
import { reRollPost } from "@/app/(app)/projects/_actions";

export default async function PostResultPage({
  params, searchParams,
}: {
  params: { slug: string; id: string };
  searchParams: { rolled?: string; error?: string; saved?: string };
}) {
  const res = await getPostById(params.id);
  if (!res.ok || !res.data) notFound();
  const post = res.data;

  const session = await getSession();
  const [nodesRes, projectRes, brandingRes, linksRes] = await Promise.all([
    nodesByIds(post.nodeIds),
    getProjectById(post.projectId),
    session ? getBranding(session.userId) : Promise.resolve({ ok: true as const, data: null }),
    linksByProject(post.projectId),
  ]);
  const nodes = nodesRes.ok ? nodesRes.data : [];
  const project = projectRes.ok ? projectRes.data : null;
  const branding = brandingRes.ok ? brandingRes.data : null;

  // Relationships between the selected nodes only — gives the AI cross-context.
  const labelById = Object.fromEntries(nodes.map((n) => [n.id, n.label]));
  const selected = new Set(post.nodeIds);
  const links = (linksRes.ok ? linksRes.data : [])
    .filter((l) => selected.has(l.sourceNode) && selected.has(l.targetNode))
    .map((l) => ({ from: labelById[l.sourceNode], label: l.label, to: labelById[l.targetNode] }));

  // Human-readable price range from the project's min/max (triệu/m² or tỷ — left
  // as-is; admins author the raw integers).
  const priceText =
    project?.priceMin != null || project?.priceMax != null
      ? [project?.priceMin, project?.priceMax]
          .filter((v) => v != null)
          .map((v) => Number(v).toLocaleString("vi-VN"))
          .join(" – ")
      : null;

  // Branded feed images (free tier gets a watermark).
  let images: { url: string; nodeId: string; placeholder?: boolean }[] = [];
  if (session) {
    const tierRes = await getActiveTier(session.userId);
    const watermark = (tierRes.ok ? tierRes.data : "free") === "free" ? "via app" : null;
    images = await getBrandedImages(session.userId, post.nodeIds, { watermark });
  }

  // Editable per-slot composition (variant picker). Empty for temp-caption posts
  // (no authored blocks) → fall back to the static caption card.
  const editable = session
    ? await getEditableComposition(post, session.userId)
    : { slots: [], addable: [] };

  const composer = {
    project: { name: project?.name, locationText: project?.locationText, phase: project?.phase, priceText },
    nodes: nodes.map((n) => ({
      label: n.label, facts: n.facts, talkpoint: n.talkpoint, subLabel: n.subLabel, category: n.category,
    })),
    links,
    branding: { displayName: branding?.displayName, phone: branding?.phone, zalo: branding?.zalo },
  };

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bài đã tạo</h1>
        <Link href={`/projects/${params.slug}`} className="text-sm text-slate-400 hover:text-slate-200">
          ← Tạo bài khác
        </Link>
      </header>

      {searchParams.error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{searchParams.error}</p>
      )}
      {searchParams.rolled && (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Đã đổi sang mẫu khác.</p>
      )}
      {searchParams.saved && (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">Đã lưu bản này.</p>
      )}

      {editable.slots.length > 0 ? (
        <>
          <p className="text-xs text-slate-500">Bấm ‹ › ở mỗi đoạn để đổi mẫu; bài bên dưới cập nhật ngay.</p>
          <CaptionEditor slots={editable.slots} addable={editable.addable} composer={composer} postId={post.id} slug={params.slug} />
        </>
      ) : (
        <>
          <CaptionCard caption={post.caption} composer={composer} />
          <form action={reRollPost} className="self-start">
            <input type="hidden" name="post_id" value={post.id} />
            <input type="hidden" name="slug" value={params.slug} />
            <Button type="submit" variant="outline">🎲 Đổi mẫu khác</Button>
          </form>
        </>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Ảnh đóng logo</h2>
        <BrandedImageGrid images={images} labels={labelById} postId={post.id} slug={params.slug} />
      </section>

      {nodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nodes.map((n) => (
            <span key={n.id} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {n.label}
            </span>
          ))}
        </div>
      )}
      {!branding && (
        <p className="text-xs text-amber-500/80">
          Mẹo: thiết lập tên + SĐT ở <Link href="/settings" className="underline">Thương hiệu</Link> để [TEN_SALE]/[SDT] tự điền vào bài & đóng lên ảnh.
        </p>
      )}
    </main>
  );
}
