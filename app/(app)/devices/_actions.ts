"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth";

const DEVICE_COOKIE = "bds_device";

// Evict one device. If it's the current device → sign out here; otherwise
// register the current (new) device as active and continue to the app.
export async function revokeDeviceAction(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const target = String(fd.get("device_id") ?? "");
  if (!target) redirect("/devices");

  const supabase = createClient();
  const now = new Date().toISOString();
  await supabase
    .from("user_devices")
    .update({ revoked_at: now })
    .eq("user_id", session.userId)
    .eq("device_id", target);

  const current = cookies().get(DEVICE_COOKIE)?.value;
  if (target === current) {
    await supabase.auth.signOut();
    redirect("/login?reason=device-self");
  }

  if (current) {
    const h = headers();
    await supabase.from("user_devices").upsert({
      user_id: session.userId,
      device_id: current,
      user_agent: h.get("user-agent") ?? "",
      ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim(),
      last_seen_at: now,
      revoked_at: null,
    });
  }
  redirect("/dashboard");
}
