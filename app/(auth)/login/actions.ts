"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthState {
  error?: string;
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirect") ?? "/dashboard");

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  redirect(redirectTo);
}

export async function signup(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const supabase = createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };

  // Profile is auto-created by the on_auth_user_created trigger.
  redirect("/dashboard");
}

export async function signout() {
  const supabase = createClient();
  // Free this device's slot so the 2-device limit doesn't strand the user.
  const deviceId = cookies().get("bds_device")?.value;
  if (deviceId) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase
        .from("user_devices")
        .update({ revoked_at: new Date().toISOString() })
        .eq("user_id", data.user.id)
        .eq("device_id", deviceId);
    }
  }
  await supabase.auth.signOut();
  redirect("/login");
}
