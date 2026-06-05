"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { getActiveTier, checkPostQuota } from "@/lib/gate/tier";
import { nodesByIds } from "@/lib/repo/nodes";
import { blocksByNode } from "@/lib/repo/blocks";
import { getBranding } from "@/lib/repo/branding";
import { getProjectById } from "@/lib/repo/projects";
import { listTemplates } from "@/lib/repo/templates";
import { pickTemplate } from "@/lib/engine/templates";
import { assembleCaption, type NodeWithBlocks } from "@/lib/engine/assembly";
import { PROMPT_VERSION } from "@/lib/engine/promptComposer";
import { buildTempCaption } from "@/lib/engine/tempCaption";
import { isoWeek } from "@/lib/engine/variants";
import type { AgentBranding, KnowledgeNode, Project } from "@/types/domain";

const DEFAULT_STRUCTURE = ["hook", "body", "proof", "cta"];

// Branding is required before posting: it fills [TEN_SALE]/[SDT] and stamps the
// image. A profile without name + phone can't produce a complete post.
function brandingComplete(b: AgentBranding | null): boolean {
  return !!b && !!b.displayName?.trim() && !!b.phone?.trim();
}

// Shared assembly: resolve blocks/template for the given nodes and run the
// deterministic engine, falling back to a temp caption when no blocks exist.
// Used by both create and re-roll so they stay in lockstep.
async function buildCaption(opts: {
  nodes: KnowledgeNode[];
  branding: AgentBranding | null;
  project: Project | null;
  seed: string;
}): Promise<{ caption: string; templateId: string | null; usedEngine: boolean }> {
  const { nodes, branding, project, seed } = opts;
  const [templatesRes, ...blockResults] = await Promise.all([
    listTemplates(),
    ...nodes.map((n) => blocksByNode(n.id)),
  ]);
  const templates = templatesRes.ok ? templatesRes.data : [];

  const nodesWithBlocks: NodeWithBlocks[] = nodes.map((n, i) => ({
    id: n.id,
    label: n.label,
    category: n.category,
    facts: n.facts,
    blocks: blockResults[i]?.ok ? blockResults[i].data : [],
  }));
  const ctaBlocks = nodesWithBlocks.flatMap((n) => n.blocks.filter((b) => b.role === "cta"));

  const template = pickTemplate(templates, nodes.map((n) => n.category), seed);
  const assembled = assembleCaption({
    structure: template?.structure ?? DEFAULT_STRUCTURE,
    nodes: nodesWithBlocks,
    ctaBlocks,
    ctx: {
      branding: branding
        ? { displayName: branding.displayName, phone: branding.phone, zalo: branding.zalo }
        : undefined,
      project: project ? { name: project.name, view360Url: project.view360Url } : undefined,
    },
    seed,
  });

  const usedEngine = assembled.caption.length > 0;
  return {
    caption: usedEngine ? assembled.caption : buildTempCaption(nodes),
    templateId: usedEngine ? template?.id ?? null : null,
    usedEngine,
  };
}

// Create a post from 1–4 selected nodes: gate (branding + quota) → validate →
// Assembly Engine (falls back to a deterministic temp caption when blocks
// aren't authored yet).
export async function createPost(projectId: string, slug: string, nodeIds: string[]) {
  const back = `/projects/${slug}`;
  const session = await getSession();
  if (!session) redirect("/login");

  if (nodeIds.length < 1 || nodeIds.length > 4) {
    redirect(`${back}?error=${encodeURIComponent("Chọn 1–4 điểm")}`);
  }

  // Onboarding gate: branding must be complete before the first post.
  const brandingRes = await getBranding(session.userId);
  const branding = brandingRes.ok ? brandingRes.data : null;
  if (!brandingComplete(branding)) {
    redirect(`/settings?next=${encodeURIComponent(back)}&error=${encodeURIComponent("Cập nhật Tên + SĐT trước khi tạo bài — thông tin này tự điền vào bài & đóng lên ảnh.")}`);
  }

  const tierRes = await getActiveTier(session.userId);
  const tier = tierRes.ok ? tierRes.data : "free";
  const quota = await checkPostQuota(session.userId, tier);
  if (quota.ok && !quota.data.allowed) {
    redirect(`${back}?error=${encodeURIComponent(`Hết lượt hôm nay (${quota.data.used}/${quota.data.limit})`)}`);
  }

  const [nodesRes, projectRes] = await Promise.all([nodesByIds(nodeIds), getProjectById(projectId)]);
  const nodes = nodesRes.ok ? nodesRes.data : [];
  if (nodes.length !== nodeIds.length || nodes.some((n) => n.projectId !== projectId)) {
    redirect(`${back}?error=${encodeURIComponent("Điểm không hợp lệ")}`);
  }
  const project = projectRes.ok ? projectRes.data : null;

  const seed = `${session.userId}:${[...nodeIds].sort().join(",")}:${isoWeek()}`;
  const built = await buildCaption({ nodes, branding, project, seed });

  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_posts")
    .insert({
      user_id: session.userId,
      project_id: projectId,
      node_ids: nodeIds,
      variant_seed: seed,
      caption: built.caption,
      template_id: built.templateId,
      prompt_version: built.usedEngine ? PROMPT_VERSION : null,
    })
    .select("id")
    .single();
  if (error || !data) {
    redirect(`${back}?error=${encodeURIComponent(error?.message ?? "Lỗi tạo bài")}`);
  }

  await supabase
    .from("generated_post_nodes")
    .insert(nodeIds.map((node_id) => ({ post_id: data.id, node_id })));

  redirect(`/projects/${slug}/post/${data.id}`);
}

// Re-roll: regenerate a different caption variant for an existing post (same
// nodes), by bumping a roll counter on the seed. Edits the post in place — does
// NOT consume post quota.
export async function reRollPost(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const postId = String(fd.get("post_id") ?? "");
  const slug = String(fd.get("slug") ?? "");
  const dest = `/projects/${slug}/post/${postId}`;

  const { getPostById } = await import("@/lib/repo/posts");
  const postRes = await getPostById(postId);
  if (!postRes.ok || !postRes.data) {
    redirect(`${dest}?error=${encodeURIComponent("Không tìm thấy bài")}`);
  }
  const post = postRes.data;

  const [nodesRes, projectRes, brandingRes] = await Promise.all([
    nodesByIds(post.nodeIds),
    getProjectById(post.projectId),
    getBranding(session.userId),
  ]);
  const nodes = nodesRes.ok ? nodesRes.data : [];
  const project = projectRes.ok ? projectRes.data : null;
  const branding = brandingRes.ok ? brandingRes.data : null;

  // Bump (or start) the roll counter on the existing seed.
  const m = post.variantSeed.match(/:r(\d+)$/);
  const base = m ? post.variantSeed.replace(/:r\d+$/, "") : post.variantSeed;
  const seed = `${base}:r${m ? Number(m[1]) + 1 : 1}`;

  const built = await buildCaption({ nodes, branding, project, seed });

  const supabase = createClient();
  const { error } = await supabase
    .from("generated_posts")
    .update({
      caption: built.caption,
      variant_seed: seed,
      template_id: built.templateId,
      prompt_version: built.usedEngine ? PROMPT_VERSION : null,
    })
    .eq("id", postId);
  if (error) {
    redirect(`${dest}?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`${dest}?rolled=1`);
}

// Persist an agent-edited caption (from the slot editor). Owner-only via RLS.
export async function saveCaption(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const postId = String(fd.get("post_id") ?? "");
  const slug = String(fd.get("slug") ?? "");
  const caption = String(fd.get("caption") ?? "").trim();
  const dest = `/projects/${slug}/post/${postId}`;
  if (!caption) redirect(`${dest}?error=${encodeURIComponent("Bài trống")}`);

  const supabase = createClient();
  const { error } = await supabase.from("generated_posts").update({ caption }).eq("id", postId);
  if (error) redirect(`${dest}?error=${encodeURIComponent(error.message)}`);
  redirect(`${dest}?saved=1`);
}

// Generate (or reuse) a 9:16 story image for one node of a post and open it.
export async function downloadStory(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const postId = String(fd.get("post_id") ?? "");
  const slug = String(fd.get("slug") ?? "");
  const nodeId = String(fd.get("node_id") ?? "");

  const { getPostById } = await import("@/lib/repo/posts");
  const { getActiveTier } = await import("@/lib/gate/tier");
  const { getBrandedImages } = await import("@/lib/branding/pipeline");

  const postRes = await getPostById(postId);
  if (!postRes.ok || !postRes.data || !postRes.data.nodeIds.includes(nodeId)) {
    redirect(`/projects/${slug}/post/${postId}?error=${encodeURIComponent("Không hợp lệ")}`);
  }
  const tierRes = await getActiveTier(session.userId);
  const watermark = (tierRes.ok ? tierRes.data : "free") === "free" ? "via app" : null;
  const imgs = await getBrandedImages(session.userId, [nodeId], { story: true, watermark });
  if (imgs.length === 0) {
    redirect(`/projects/${slug}/post/${postId}?error=${encodeURIComponent("Chưa có ảnh/thương hiệu")}`);
  }
  redirect(imgs[0].url);
}

// Form wrapper for one-tap "Tạo bài ngay" from the dashboard suggestion.
export async function createPostAction(fd: FormData) {
  const projectId = String(fd.get("project_id") ?? "");
  const slug = String(fd.get("slug") ?? "");
  const nodeIds = String(fd.get("node_ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  await createPost(projectId, slug, nodeIds);
}
