"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// node_content_blocks is RLS server-only → writes use the service-role client.
// These actions must only be reachable behind the admin route guard.

const blockSchema = z.object({
  node_id: z.string().uuid(),
  role: z.enum(["hook", "body", "proof", "cta"]),
  variant_no: z.number().int().min(1),
  text: z.string().min(1, "Text không được trống"),
  tone: z.enum(["neutral", "fomo", "story"]),
  min_confidence: z.enum(["verified", "sales_claim", "unverified"]),
  fact_keys: z.array(z.string()),
  is_enabled: z.boolean(),
});

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
function backTo(fd: FormData) {
  return `/admin/projects/${str(fd, "project_id")}/nodes/${str(fd, "node_id")}/blocks`;
}
function fail(path: string, msg: string): never {
  redirect(`${path}?error=${encodeURIComponent(msg)}`);
}

export async function createBlock(fd: FormData) {
  const path = backTo(fd);
  const factKeys = str(fd, "fact_keys")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const parsed = blockSchema.safeParse({
    node_id: str(fd, "node_id"),
    role: str(fd, "role"),
    variant_no: Number(str(fd, "variant_no") || "1"),
    text: str(fd, "text"),
    tone: str(fd, "tone"),
    min_confidence: str(fd, "min_confidence"),
    fact_keys: factKeys,
    is_enabled: fd.get("is_enabled") != null,
  });
  if (!parsed.success) fail(path, parsed.error.issues[0].message);

  const supabase = createAdminClient();
  const { error } = await supabase.from("node_content_blocks").insert(parsed.data);
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?ok=1`);
}

export async function deleteBlock(fd: FormData) {
  const path = backTo(fd);
  const supabase = createAdminClient();
  const { error } = await supabase.from("node_content_blocks").delete().eq("id", str(fd, "id"));
  if (error) fail(path, error.message);
  revalidatePath(path);
  redirect(`${path}?ok=1`);
}
