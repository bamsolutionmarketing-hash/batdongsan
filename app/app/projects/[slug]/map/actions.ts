"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

export interface MapEditState {
  error?: string;
  ok?: boolean;
}

async function adminContext(slug: string) {
  const session = await requireSession();
  const orgId = session.profile?.org_id;
  if (session.profile?.role !== "admin" || !orgId) {
    return { error: "Chỉ quản trị viên." as const };
  }
  const supabase = createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!project) return { error: "Không tìm thấy dự án." as const };
  return { supabase, orgId, projectId: project.id, slug };
}

export async function addNode(_prev: MapEditState, formData: FormData): Promise<MapEditState> {
  const slug = String(formData.get("slug") ?? "");
  const ctx = await adminContext(slug);
  if ("error" in ctx) return ctx;

  const label = String(formData.get("label") ?? "").trim();
  const kind = String(formData.get("kind") ?? "concept");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!label) return { error: "Nhập nội dung node." };

  const { error } = await ctx.supabase.from("map_nodes").insert({
    org_id: ctx.orgId,
    project_id: ctx.projectId,
    label,
    kind,
    note,
  });
  if (error) return { error: error.message };
  revalidatePath(`/app/projects/${slug}/map`);
  return { ok: true };
}

export async function deleteNode(_prev: MapEditState, formData: FormData): Promise<MapEditState> {
  const slug = String(formData.get("slug") ?? "");
  const ctx = await adminContext(slug);
  if ("error" in ctx) return ctx;

  const id = String(formData.get("nodeId") ?? "");
  // Edges cascade via FK on delete.
  const { error } = await ctx.supabase.from("map_nodes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/app/projects/${slug}/map`);
  return { ok: true };
}

export async function addEdge(_prev: MapEditState, formData: FormData): Promise<MapEditState> {
  const slug = String(formData.get("slug") ?? "");
  const ctx = await adminContext(slug);
  if ("error" in ctx) return ctx;

  const sourceId = String(formData.get("sourceId") ?? "");
  const targetId = String(formData.get("targetId") ?? "");
  const kind = String(formData.get("kind") ?? "relates");
  if (!sourceId || !targetId) return { error: "Chọn 2 node để nối." };
  if (sourceId === targetId) return { error: "Không thể nối node với chính nó." };

  const { error } = await ctx.supabase.from("map_edges").insert({
    org_id: ctx.orgId,
    project_id: ctx.projectId,
    source_id: sourceId,
    target_id: targetId,
    kind,
  });
  if (error) return { error: error.message };
  revalidatePath(`/app/projects/${slug}/map`);
  return { ok: true };
}

export async function deleteEdge(_prev: MapEditState, formData: FormData): Promise<MapEditState> {
  const slug = String(formData.get("slug") ?? "");
  const ctx = await adminContext(slug);
  if ("error" in ctx) return ctx;

  const id = String(formData.get("edgeId") ?? "");
  const { error } = await ctx.supabase.from("map_edges").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/app/projects/${slug}/map`);
  return { ok: true };
}
