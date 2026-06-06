"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSession, isAdmin, isSuperAdmin } from "@/lib/auth";

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const numOrNull = (fd: FormData, k: string) => {
  const s = str(fd, k);
  return s === "" ? null : Number(s);
};
const back = (q: string) => redirect(`/admin?${q}`);

// Super admin: promote a user (by email) to admin with quotas.
export async function promoteAdminAction(fd: FormData) {
  const session = await getSession();
  if (!isSuperAdmin(session)) back("error=" + encodeURIComponent("Chỉ super admin"));
  const { error } = await createClient().rpc("super_promote_admin", {
    p_email: str(fd, "email"),
    p_agent_quota: numOrNull(fd, "agent_quota"),
    p_daily_quota: numOrNull(fd, "daily_quota"),
    p_project_quota: numOrNull(fd, "project_quota"),
  });
  if (error) back("error=" + encodeURIComponent(error.message));
  revalidatePath("/admin");
  back("ok=" + encodeURIComponent("Đã cấp quyền admin"));
}

// Admin (or super): activate / deactivate an agent by email.
export async function setAgentActiveAction(fd: FormData) {
  const session = await getSession();
  if (!isAdmin(session)) back("error=" + encodeURIComponent("Không có quyền"));
  const active = str(fd, "active") === "true";
  const { error } = await createClient().rpc("admin_activate_agent", {
    p_email: str(fd, "email"),
    p_active: active,
  });
  if (error) back("error=" + encodeURIComponent(error.message));
  revalidatePath("/admin");
  back("ok=" + encodeURIComponent(active ? "Đã kích hoạt agent" : "Đã tắt kích hoạt"));
}
