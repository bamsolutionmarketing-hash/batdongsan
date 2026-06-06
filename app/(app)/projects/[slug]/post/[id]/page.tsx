import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/repo/posts";
import { nodesByIds, linksByProject } from "@/lib/repo/nodes";
import { getProjectById } from "@/lib/repo/projects";
import { getBranding } from "@/lib/repo/branding";
import { getActiveTier } from "@/lib/gate/tier";
import { getBrandedImages, getCarousel, getCollage, getFactCards, type AssembledSet } from "@/lib/branding/pipeline";
import { getSession } from "@/lib/auth";
import { getEditableComposition } from "@/lib/post/editable";
import { CaptionCard } from "@/components/post/CaptionCard";
import { CaptionEditor } from "@/components/post/CaptionEditor";
import { BrandedImageGrid } from "@/components/post/BrandedImageGrid";
import { ImageSetView } from "@/components/post/ImageSetPanel";
import { VideoMaker } from "@/components/post/VideoMaker";
import { ScriptPanel } from "@/components/script/ScriptPanel";
import { Button } from "@/components/ui/button";
import { reRollPost } from "@/app/(app)/projects/_actions";

export default async function PostResultPage({
  params, searchParams,
}: {
  params: { slug: string; id: string };
  searchParams: { rolled?: string; error?: string; saved?: string; set?: string };
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

  // Image set: "single" (per-node branded grid, default), "carousel", "collage",
  // "facts" (data cards), or "video" (client slideshow from carousel slides).
  // Only the requested set is generated (lazy, on tab click).
  const SET_KINDS = ["single", "carousel", "collage", "facts", "video"] as const;
  type SetKind = (typeof SET_KINDS)[number];
  const setKind: SetKind = (SET_KINDS as readonly string[]).includes(searchParams.set ?? "")
    ? (searchParams.set as SetKind)
    : "single";
  let images: { url: string; nodeId: string; placeholder?: boolean }[] = [];
  let assembled: AssembledSet | null = null;
  if (session) {
    const tierRes = await getActiveTier(session.userId);
    const watermark = (tierRes.ok ? tierRes.data : "free") === "free" ? "via app" : null;
    if (setKind === "single") images = await getBrandedImages(session.userId, post.nodeIds, { watermark });
    else if (setKind === "carousel" || setKind === "video") assembled = await getCarousel(session.userId, post.id, post.nodeIds, { watermark });
    else if (setKind === "collage") assembled = await getCollage(session.userId, post.id, post.nodeIds, { watermark });
    else assembled = await getFactCards(session.userId, post.id, post.nodeIds, { watermark });
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

  const base = `/projects/${params.slug}/post/${post.id}`;
  const setTabs: [string, string][] = [
    ["single", "Ảnh lẻ"],
    ["carousel", "Carousel"],
    ...(post.nodeIds.length >= 2 ? ([["collage", "Ghép"]] as [string, string][]) : []),
    ["facts", "Số liệu"],
    ["video", "Video"],
  ];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bài đã tạo</h1>
        <Link href={`/projects/${params.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
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
          <p className="text-xs text-muted-foreground">Bấm ‹ › ở mỗi đoạn để đổi mẫu; bài bên dưới cập nhật ngay.</p>
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
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Bộ ảnh</h2>
          <div className="flex gap-1 text-xs">
            {setTabs.map(([k, lbl]) => (
              <Link
                key={k}
                href={k === "single" ? base : `${base}?set=${k}`}
                scroll={false}
                className={`rounded-full px-3 py-1 transition ${setKind === k ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:text-foreground"}`}
              >
                {lbl}
              </Link>
            ))}
          </div>
        </div>
        {setKind === "single" ? (
          <BrandedImageGrid images={images} labels={labelById} postId={post.id} slug={params.slug} />
        ) : setKind === "video" ? (
          <div className="flex flex-col gap-4">
            <ScriptPanel projectId={post.projectId} />
            <VideoMaker images={assembled?.urls ?? []} postId={post.id} />
          </div>
        ) : (
          <ImageSetView kind={setKind} set={assembled} />
        )}
      </section>

      {nodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nodes.map((n) => (
            <span key={n.id} className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground">
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
