import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/repo/posts";
import { nodesByIds } from "@/lib/repo/nodes";
import { getProjectById } from "@/lib/repo/projects";
import { getBranding } from "@/lib/repo/branding";
import { getSession } from "@/lib/auth";
import { CaptionCard } from "@/components/post/CaptionCard";

export default async function PostResultPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const res = await getPostById(params.id);
  if (!res.ok || !res.data) notFound();
  const post = res.data;

  const session = await getSession();
  const [nodesRes, projectRes, brandingRes] = await Promise.all([
    nodesByIds(post.nodeIds),
    getProjectById(post.projectId),
    session ? getBranding(session.userId) : Promise.resolve({ ok: true as const, data: null }),
  ]);
  const nodes = nodesRes.ok ? nodesRes.data : [];
  const project = projectRes.ok ? projectRes.data : null;
  const branding = brandingRes.ok ? brandingRes.data : null;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bài đã tạo</h1>
        <Link href={`/projects/${params.slug}`} className="text-sm text-slate-400 hover:text-slate-200">
          ← Tạo bài khác
        </Link>
      </header>

      <CaptionCard
        caption={post.caption}
        composer={{
          project: { name: project?.name, locationText: project?.locationText },
          nodes: nodes.map((n) => ({ label: n.label, facts: n.facts })),
          branding: {
            displayName: branding?.displayName,
            phone: branding?.phone,
            zalo: branding?.zalo,
          },
        }}
      />

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
          Mẹo: thiết lập tên + SĐT ở Thương hiệu để [TEN_SALE]/[SDT] tự điền vào bài & CTA.
        </p>
      )}
      <p className="text-xs text-slate-600">
        Ảnh đóng logo cá nhân sẽ thêm ở S5 (branding pipeline).
      </p>
    </main>
  );
}
