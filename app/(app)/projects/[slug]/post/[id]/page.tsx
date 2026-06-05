import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/repo/posts";
import { nodesByIds } from "@/lib/repo/nodes";
import { CaptionCard } from "@/components/post/CaptionCard";

// Minimal AI-prompt wrapper (full Prompt Composer = S4).
function wrapPrompt(caption: string): string {
  return [
    "Viết lại bài đăng Facebook dưới đây theo giọng tự nhiên của một môi giới BĐS, thân thiện hơn, có thể thêm emoji.",
    "",
    "QUY TẮC BẮT BUỘC:",
    "- Giữ nguyên 100% con số và mốc thời gian",
    "- KHÔNG thêm số liệu/cam kết nào không có trong bài gốc",
    "- KHÔNG hứa lợi nhuận hay cam kết tăng giá",
    "- Giữ nguyên thông tin liên hệ cuối bài",
    "---",
    caption,
  ].join("\n");
}

export default async function PostResultPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const res = await getPostById(params.id);
  if (!res.ok || !res.data) notFound();
  const post = res.data;
  const nodesRes = await nodesByIds(post.nodeIds);
  const nodes = nodesRes.ok ? nodesRes.data : [];

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-5 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bài đã tạo</h1>
        <Link href={`/projects/${params.slug}`} className="text-sm text-slate-400 hover:text-slate-200">
          ← Tạo bài khác
        </Link>
      </header>

      <CaptionCard caption={post.caption} prompt={wrapPrompt(post.caption)} />

      {nodes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nodes.map((n) => (
            <span key={n.id} className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-300">
              {n.label}
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-slate-600">
        Caption tạm thời (deterministic). Assembly Engine + prompt composer đầy đủ ở S4; ảnh đóng logo ở S5.
      </p>
    </main>
  );
}
