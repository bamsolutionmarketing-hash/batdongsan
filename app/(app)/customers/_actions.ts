"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";
import type { Tier } from "@/lib/finance/lead";

const STATUSES = ["moi", "dang_cham", "da_hen", "da_coc", "da_chot", "ngung"];

export async function createCustomer(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim() || null;
  const source = String(fd.get("source") ?? "").trim() || null;
  const followup = String(fd.get("next_followup_at") ?? "").trim() || null;
  if (!name) redirect("/customers?error=" + encodeURIComponent("Cần tên khách"));
  const supabase = createClient();
  const { error } = await supabase.from("customers").insert({
    user_id: session.userId, name, phone, source, next_followup_at: followup,
  });
  if (error) redirect("/customers?error=" + encodeURIComponent(error.message));
  revalidatePath("/customers");
  redirect("/customers?ok=1");
}

export async function updateCustomer(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  const followup = String(fd.get("next_followup_at") ?? "").trim() || null;
  const note = String(fd.get("note") ?? "").trim() || null;
  if (!id || !STATUSES.includes(status)) redirect("/customers?error=" + encodeURIComponent("Dữ liệu không hợp lệ"));
  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .update({ status, next_followup_at: followup, note, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", session.userId);
  if (error) redirect("/customers?error=" + encodeURIComponent(error.message));
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  redirect("/customers?ok=1");
}

export async function deleteCustomer(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const id = String(fd.get("id") ?? "");
  const supabase = createClient();
  await supabase.from("customers").delete().eq("id", id).eq("user_id", session.userId);
  revalidatePath("/customers");
  redirect("/customers");
}

// Called from the calculator's discovery panel (client component) — saves the
// chân dung the engines just computed so it survives reloads and feeds the
// pipeline. Plain-object action (not a form) so the panel keeps its state.
export interface DiscoverySavePayload {
  name: string;
  phone: string;
  leadScore: number;
  leadTier: Tier;
  incomeLow: number | null;
  incomeHigh: number | null;
  discovery: Record<string, unknown>;
}

export async function saveDiscoveryCustomer(
  p: DiscoverySavePayload,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Chưa đăng nhập" };
  const name = p.name.trim();
  if (!name) return { ok: false, error: "Cần tên khách" };
  const score = Math.max(0, Math.min(100, Math.round(p.leadScore)));
  const tier: Tier = (["nong", "am", "nguoi"] as const).includes(p.leadTier) ? p.leadTier : "nguoi";
  const supabase = createClient();
  const { error } = await supabase.from("customers").insert({
    user_id: session.userId,
    name,
    phone: p.phone.trim() || null,
    source: "kham_pha",
    lead_score: score,
    lead_tier: tier,
    income_low: p.incomeLow,
    income_high: p.incomeHigh,
    discovery: p.discovery,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return { ok: true };
}
