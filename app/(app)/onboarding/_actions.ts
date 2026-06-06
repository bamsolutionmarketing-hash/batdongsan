"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getProjectById } from "@/lib/repo/projects";
import { getAccessState } from "@/lib/repo/access";

// Onboarding step 2: open the agent's first (free, in-plan) project, then go
// straight to its map to create the first post.
export async function onboardingPickProject(fd: FormData) {
  const session = await requireSession();
  const projectId = String(fd.get("project_id") ?? "");
  if (!projectId) redirect("/onboarding");

  const st = await getAccessState(session.userId);
  if (!st.all && !st.accessible.has(projectId)) {
    // Within free/pro base → included (free); otherwise still allow (monthly) so
    // onboarding never dead-ends. Managed sub-agents already inherit a pool.
    const free = !st.managed && st.includedCount < st.base;
    const expires = free ? null : new Date(Date.now() + 30 * 86400000).toISOString();
    const { error } = await createClient().from("project_access").upsert({
      user_id: session.userId, project_id: projectId, paid: !free, expires_at: expires,
    });
    if (error) redirect(`/onboarding?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/projects");
  const res = await getProjectById(projectId);
  const slug = res.ok && res.data ? res.data.slug : null;
  redirect(slug ? `/projects/${slug}` : "/dashboard");
}
