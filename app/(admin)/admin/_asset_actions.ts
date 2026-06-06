"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Master image upload → private `assets` bucket + node_assets row. Service-role
// client; reachable only behind the admin route guard.

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_BYTES = 10 * 1024 * 1024;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
function backTo(fd: FormData) {
  return `/admin/projects/${str(fd, "project_id")}/nodes/${str(fd, "node_id")}/blocks`;
}
function fail(path: string, msg: string): never {
  redirect(`${path}?error=${encodeURIComponent(msg)}`);
}

export async function uploadAsset(fd: FormData) {
  const path = backTo(fd);
  const nodeId = str(fd, "node_id");
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) fail(path, "Chưa chọn ảnh");
  if (file.size > MAX_BYTES) fail(path, "Ảnh quá lớn (>10MB)");
  const ext = EXT[file.type];
  if (!ext) fail(path, "Định dạng phải là PNG/JPEG/WebP");

  const supabase = createAdminClient();
  const storagePath = `${nodeId}/${randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await supabase.storage
    .from("assets")
    .upload(storagePath, buf, { contentType: file.type, upsert: false });
  if (up.error) fail(path, up.error.message);

  const { error } = await supabase.from("node_assets").insert({
    node_id: nodeId,
    type: "image",
    storage_path: storagePath,
    safe_zone: str(fd, "safe_zone") || "bottom_right",
    sort_order: Number(str(fd, "sort_order") || "0"),
  });
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?ok=1`);
}

export async function deleteAsset(fd: FormData) {
  const path = backTo(fd);
  const id = str(fd, "id");
  const storagePath = str(fd, "storage_path");
  const supabase = createAdminClient();
  await supabase.storage.from("assets").remove([storagePath]);
  const { error } = await supabase.from("node_assets").delete().eq("id", id);
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?ok=1`);
}

// ── project representative image (public `thumbnails` bucket) ───────────────
const THUMB_MAX = 5 * 1024 * 1024;

export async function uploadProjectThumbnail(fd: FormData) {
  const projectId = str(fd, "project_id");
  const path = `/admin/projects/${projectId}`;
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) fail(path, "Chưa chọn ảnh");
  if (file.size > THUMB_MAX) fail(path, "Ảnh quá lớn (>5MB)");
  const ext = EXT[file.type];
  if (!ext) fail(path, "Định dạng phải là PNG/JPEG/WebP");

  const supabase = createAdminClient();
  const storagePath = `${projectId}/${randomUUID()}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await supabase.storage
    .from("thumbnails")
    .upload(storagePath, buf, { contentType: file.type, upsert: false });
  if (up.error) fail(path, up.error.message);

  const publicUrl = supabase.storage.from("thumbnails").getPublicUrl(storagePath).data.publicUrl;
  const { error } = await supabase.from("projects").update({ thumbnail_url: publicUrl }).eq("id", projectId);
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?ok=1`);
}

export async function removeProjectThumbnail(fd: FormData) {
  const projectId = str(fd, "project_id");
  const path = `/admin/projects/${projectId}`;
  const supabase = createAdminClient();
  const { error } = await supabase.from("projects").update({ thumbnail_url: null }).eq("id", projectId);
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?ok=1`);
}
