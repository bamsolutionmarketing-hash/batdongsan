"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface OnboardingState {
  error?: string;
}

// Create a new org and make the current user its admin.
// Uses the service-role client: a brand-new user has no profile/org yet, so RLS
// would otherwise block the very first writes (chicken-and-egg).
export async function createOrg(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const orgName = String(formData.get("orgName") ?? "").trim();
  if (!orgName) return { error: "Vui lòng nhập tên tổ chức." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // If the user already has a profile with an org, skip straight to the app.
  const { data: existing } = await admin
    .from("profiles")
    .select("org_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing?.org_id) redirect("/app");

  const { data: org, error: orgErr } = await admin
    .from("orgs")
    .insert({ name: orgName })
    .select("id")
    .single();
  if (orgErr) return { error: orgErr.message };

  const { error: profErr } = await admin
    .from("profiles")
    .upsert({ user_id: user.id, org_id: org.id, role: "admin" });
  if (profErr) return { error: profErr.message };

  redirect("/app");
}
