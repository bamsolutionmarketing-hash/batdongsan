"use server";

import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// STUB upgrade (PayOS thật nối sau). Tạo subscription active để test mở khoá
// tier. subscriptions là service-only (RLS) → dùng admin client.
export async function upgradeStub(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/pricing");
  const tier = String(fd.get("tier") ?? "pro");
  if (tier !== "pro" && tier !== "team") redirect("/pricing");

  const admin = createAdminClient();
  const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
  const { error } = await admin.from("subscriptions").insert({
    user_id: session.userId,
    tier,
    status: "active",
    current_period_end: periodEnd,
    payos_order_code: `stub-${randomUUID().slice(0, 8)}`,
  });
  if (error) redirect(`/pricing?error=${encodeURIComponent(error.message)}`);
  redirect("/dashboard?ok=1");
}
