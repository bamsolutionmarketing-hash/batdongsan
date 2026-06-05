"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import { getPostById } from "@/lib/repo/posts";

// Toggle the "đã đăng" flag (drives the calendar + posting streak).
export async function markPosted(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = String(fd.get("post_id") ?? "");
  const posted = String(fd.get("posted") ?? "") === "1";
  const supabase = createClient();
  await supabase.from("generated_posts").update({ posted_at: posted ? new Date().toISOString() : null }).eq("id", id);
  revalidatePath("/posts");
  revalidatePath("/calendar");
  redirect("/posts");
}

// Delete a post (RLS owner-only; generated_post_nodes cascades).
export async function deletePost(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const supabase = createClient();
  await supabase.from("generated_posts").delete().eq("id", String(fd.get("post_id") ?? ""));
  revalidatePath("/posts");
  redirect("/posts");
}

// Duplicate a post (fresh draft, same nodes/caption) and open it.
export async function duplicatePost(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = String(fd.get("post_id") ?? "");
  const res = await getPostById(id);
  if (!res.ok || !res.data) redirect("/posts");
  const p = res.data;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_posts")
    .insert({
      user_id: session.userId,
      project_id: p.projectId,
      node_ids: p.nodeIds,
      variant_seed: `${p.variantSeed}:copy`,
      caption: p.caption,
      prompt_version: p.promptVersion,
    })
    .select("id")
    .single();
  if (error || !data) redirect("/posts");
  await supabase.from("generated_post_nodes").insert(p.nodeIds.map((node_id) => ({ post_id: data.id, node_id })));

  const { getProjectById } = await import("@/lib/repo/projects");
  const proj = await getProjectById(p.projectId);
  const slug = proj.ok && proj.data ? proj.data.slug : "";
  redirect(`/projects/${slug}/post/${data.id}`);
}
