"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// All admin writes go through the session server client; the knowledge/project
// RLS `*_admin` policies (is_admin()) gate them. Inputs validated with zod.

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const projectSchema = z.object({
  name: z.string().min(1, "Tên không được trống"),
  slug: z.string().regex(slugRe, "Slug: chữ thường, số, gạch nối"),
  developer_id: z.string().uuid().nullable(),
  phase: z.string().nullable(),
  location_text: z.string().nullable(),
  status: z.string().nullable(),
  price_min: z.number().int().nonnegative().nullable(),
  price_max: z.number().int().nonnegative().nullable(),
  view360_url: z.string().url().nullable().or(z.literal("").transform(() => null)),
  is_demo: z.boolean(),
  is_published: z.boolean(),
});

const factsSchema = z.array(z.object({ key: z.string(), value: z.string() }));

const nodeSchema = z.object({
  project_id: z.string().uuid(),
  node_key: z.string().regex(slugRe, "node_key: chữ thường, số, gạch nối"),
  label: z.string().min(1),
  category: z.string().min(1),
  sub_label: z.string().nullable(),
  facts: factsSchema,
  talkpoint: z.string().nullable(),
  description: z.string().nullable(),
  sort_order: z.number().int(),
});

// ── helpers ───────────────────────────────────────────────────────────────
const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  const s = v == null ? "" : String(v).trim();
  return s;
};
const orNull = (s: string) => (s === "" ? null : s);
const numOrNull = (s: string) => (s === "" ? null : Number(s));
const bool = (fd: FormData, k: string) => fd.get(k) != null;

function fail(path: string, msg: string): never {
  redirect(`${path}?error=${encodeURIComponent(msg)}`);
}

// ── projects ────────────────────────────────────────────────────────────────
export async function createProject(fd: FormData) {
  const parsed = projectSchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    developer_id: orNull(str(fd, "developer_id")),
    phase: orNull(str(fd, "phase")),
    location_text: orNull(str(fd, "location_text")),
    status: orNull(str(fd, "status")),
    price_min: numOrNull(str(fd, "price_min")),
    price_max: numOrNull(str(fd, "price_max")),
    view360_url: str(fd, "view360_url"),
    is_demo: bool(fd, "is_demo"),
    is_published: bool(fd, "is_published"),
  });
  if (!parsed.success) fail("/admin/projects/new", parsed.error.issues[0].message);

  const supabase = createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert(parsed.data)
    .select("id")
    .single();
  if (error) fail("/admin/projects/new", error.message);
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${data!.id}`);
}

export async function updateProject(fd: FormData) {
  const id = str(fd, "id");
  const parsed = projectSchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    developer_id: orNull(str(fd, "developer_id")),
    phase: orNull(str(fd, "phase")),
    location_text: orNull(str(fd, "location_text")),
    status: orNull(str(fd, "status")),
    price_min: numOrNull(str(fd, "price_min")),
    price_max: numOrNull(str(fd, "price_max")),
    view360_url: str(fd, "view360_url"),
    is_demo: bool(fd, "is_demo"),
    is_published: bool(fd, "is_published"),
  });
  if (!parsed.success) fail(`/admin/projects/${id}`, parsed.error.issues[0].message);

  const supabase = createClient();
  const { error } = await supabase.from("projects").update(parsed.data).eq("id", id);
  if (error) fail(`/admin/projects/${id}`, error.message);
  revalidatePath(`/admin/projects/${id}`);
  redirect(`/admin/projects/${id}?ok=1`);
}

// ── nodes ────────────────────────────────────────────────────────────────────
export async function createNode(fd: FormData) {
  const projectId = str(fd, "project_id");
  let facts: unknown = [];
  const raw = str(fd, "facts");
  if (raw) {
    try {
      facts = JSON.parse(raw);
    } catch {
      fail(`/admin/projects/${projectId}`, "facts không phải JSON hợp lệ");
    }
  }
  const parsed = nodeSchema.safeParse({
    project_id: projectId,
    node_key: str(fd, "node_key"),
    label: str(fd, "label"),
    category: str(fd, "category"),
    sub_label: orNull(str(fd, "sub_label")),
    facts,
    talkpoint: orNull(str(fd, "talkpoint")),
    description: orNull(str(fd, "description")),
    sort_order: Number(str(fd, "sort_order") || "0"),
  });
  if (!parsed.success) fail(`/admin/projects/${projectId}`, parsed.error.issues[0].message);

  const supabase = createClient();
  const { error } = await supabase.from("knowledge_nodes").insert(parsed.data);
  if (error) fail(`/admin/projects/${projectId}`, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?ok=1`);
}

export async function deleteNode(fd: FormData) {
  const id = str(fd, "id");
  const projectId = str(fd, "project_id");
  const supabase = createClient();
  const { error } = await supabase.from("knowledge_nodes").delete().eq("id", id);
  if (error) fail(`/admin/projects/${projectId}`, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?ok=1`);
}

// ── links ────────────────────────────────────────────────────────────────────
export async function createLink(fd: FormData) {
  const projectId = str(fd, "project_id");
  const source = str(fd, "source_node");
  const target = str(fd, "target_node");
  if (!source || !target || source === target) {
    fail(`/admin/projects/${projectId}`, "Chọn 2 node khác nhau");
  }
  const supabase = createClient();
  const { error } = await supabase.from("knowledge_links").insert({
    project_id: projectId,
    source_node: source,
    target_node: target,
    label: orNull(str(fd, "label")),
  });
  if (error) fail(`/admin/projects/${projectId}`, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?ok=1`);
}

export async function deleteLink(fd: FormData) {
  const id = str(fd, "id");
  const projectId = str(fd, "project_id");
  const supabase = createClient();
  const { error } = await supabase.from("knowledge_links").delete().eq("id", id);
  if (error) fail(`/admin/projects/${projectId}`, error.message);
  revalidatePath(`/admin/projects/${projectId}`);
  redirect(`/admin/projects/${projectId}?ok=1`);
}

// ── time triggers ────────────────────────────────────────────────────────────
export async function createTrigger(fd: FormData) {
  const projectId = str(fd, "project_id");
  const path = `/admin/projects/${projectId}`;
  const triggerDate = str(fd, "trigger_date");
  const label = str(fd, "label");
  if (!triggerDate || !label) fail(path, "Cần ngày + nhãn");
  const nodeIds = fd.getAll("node_ids").map((v) => String(v)).filter(Boolean);
  const supabase = createClient();
  const { error } = await supabase.from("time_triggers").insert({
    project_id: projectId,
    type: str(fd, "type") || "deadline",
    trigger_date: triggerDate,
    label,
    suggested_angle: orNull(str(fd, "suggested_angle")),
    node_ids: nodeIds,
    active_days_before: Number(str(fd, "active_days_before") || "7"),
  });
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?ok=1`);
}

export async function deleteTrigger(fd: FormData) {
  const projectId = str(fd, "project_id");
  const path = `/admin/projects/${projectId}`;
  const supabase = createClient();
  const { error } = await supabase.from("time_triggers").delete().eq("id", str(fd, "id"));
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?ok=1`);
}
