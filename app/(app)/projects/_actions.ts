"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { getActiveTier, checkPostQuota } from "@/lib/gate/tier";
import { nodesByIds } from "@/lib/repo/nodes";
import { buildTempCaption } from "@/lib/engine/tempCaption";

// ISO week key for deterministic per-week variant rotation.
function isoWeek(d = new Date()): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${week}`;
}

// Create a post from 1–4 selected nodes. Gate → validate → caption → log.
// Caption is a deterministic temporary build (full Assembly Engine = S4).
export async function createPost(projectId: string, slug: string, nodeIds: string[]) {
  const back = `/projects/${slug}`;
  const session = await getSession();
  if (!session) redirect("/login");

  if (nodeIds.length < 1 || nodeIds.length > 4) {
    redirect(`${back}?error=${encodeURIComponent("Chọn 1–4 điểm")}`);
  }

  // Gate: tier + daily quota.
  const tierRes = await getActiveTier(session.userId);
  const tier = tierRes.ok ? tierRes.data : "free";
  const quota = await checkPostQuota(session.userId, tier);
  if (quota.ok && !quota.data.allowed) {
    redirect(`${back}?error=${encodeURIComponent(`Hết lượt hôm nay (${quota.data.used}/${quota.data.limit})`)}`);
  }

  // Validate the nodes belong to this project (and are enabled).
  const nodesRes = await nodesByIds(nodeIds);
  const nodes = nodesRes.ok ? nodesRes.data : [];
  if (nodes.length !== nodeIds.length || nodes.some((n) => n.projectId !== projectId)) {
    redirect(`${back}?error=${encodeURIComponent("Điểm không hợp lệ")}`);
  }

  const caption = buildTempCaption(nodes);
  const variantSeed = `${session.userId}:${[...nodeIds].sort().join(",")}:${isoWeek()}`;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_posts")
    .insert({
      user_id: session.userId,
      project_id: projectId,
      node_ids: nodeIds,
      variant_seed: variantSeed,
      caption,
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
