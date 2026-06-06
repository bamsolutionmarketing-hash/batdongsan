"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAccessState } from "@/lib/repo/access";

const PAID_DAYS = 30;
const monthEnd = () => new Date(Date.now() + PAID_DAYS * 86400000).toISOString();

// Open/unlock a project. Agents: included (free) within tier base, else a
// monthly paid slot (STUB — instant; wire PayOS later). Admins: add to pool
// (free) within project_quota.
export async function unlockProject(fd: FormData) {
  const session = await requireSession();
  const projectId = String(fd.get("project_id") ?? "");
  if (!projectId) redirect("/projects");

  const st = await getAccessState(session.userId);
  if (st.all || st.accessible.has(projectId)) redirect("/projects");
  const supabase = createClient();

  if (st.role === "admin") {
    if (st.includedCount >= st.base) {
      redirect(`/projects?error=${encodeURIComponent(`Đã đạt hạn mức ${st.base} dự án (liên hệ super admin để tăng)`)}`);
    }
    const { error } = await supabase.from("project_access").upsert({ user_id: session.userId, project_id: projectId, paid: false, expires_at: null });
    if (error) redirect(`/projects?error=${encodeURIComponent(error.message)}`);
    revalidatePath("/projects");
    redirect("/projects?ok=pool");
  }

  const free = !st.managed && st.includedCount < st.base;
  const { error } = await supabase.from("project_access").upsert({
    user_id: session.userId, project_id: projectId, paid: !free, expires_at: free ? null : monthEnd(),
  });
  if (error) redirect(`/projects?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/projects");
  redirect(`/projects?ok=${free ? "free" : "paid"}`);
}

// Renew a monthly paid project for another 30 days (STUB).
export async function renewProject(fd: FormData) {
  const session = await requireSession();
  const projectId = String(fd.get("project_id") ?? "");
  const { error } = await createClient()
    .from("project_access")
    .update({ paid: true, expires_at: monthEnd() })
    .eq("user_id", session.userId)
    .eq("project_id", projectId);
  if (error) redirect(`/projects?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/projects");
  redirect("/projects?ok=renew");
}

// Drop access (agent releases a slot, or admin removes from pool).
export async function lockProject(fd: FormData) {
  const session = await requireSession();
  const projectId = String(fd.get("project_id") ?? "");
  await createClient().from("project_access").delete().eq("user_id", session.userId).eq("project_id", projectId);
  revalidatePath("/projects");
  redirect("/projects?ok=lock");
}
