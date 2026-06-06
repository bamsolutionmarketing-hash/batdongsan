import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

interface ProfileRow {
  role: "agent" | "admin" | "super_admin";
  is_active: boolean;
  managed_by: string | null;
  project_quota: number | null;
}

interface AccessRow {
  user_id: string;
  project_id: string;
  paid: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface AccessState {
  role: ProfileRow["role"];
  managed: boolean; // activated sub-agent (relies on admin pool)
  base: number; // included slots (free 1 / pro 3 / admin = project_quota / managed 0)
  includedCount: number; // included slots currently in use
  accessible: Set<string>; // project ids the user may open/use
  all: boolean; // super admin → every published project
}

const isActive = (r: AccessRow, now: number) => !r.expires_at || Date.parse(r.expires_at) > now;

async function isProTier(supabase: ReturnType<typeof createClient>, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .eq("status", "active");
  return (data as { tier: string }[] | null ?? []).some((s) => s.tier === "pro" || s.tier === "team");
}

// Resolve everything the project list / gates need for a user.
export async function getAccessState(userId: string): Promise<AccessState> {
  const empty: AccessState = { role: "agent", managed: false, base: 1, includedCount: 0, accessible: new Set(), all: false };
  if (!isSupabaseConfigured()) return { ...empty, all: true };
  const supabase = createClient();

  const { data: prof } = await supabase
    .from("profiles")
    .select("role, is_active, managed_by, project_quota")
    .eq("id", userId)
    .maybeSingle();
  const p = (prof as ProfileRow | null) ?? null;
  const role = p?.role ?? "agent";
  const now = Date.now();

  if (role === "super_admin") {
    const { data } = await supabase.from("projects").select("id").eq("is_published", true);
    return { role, managed: false, base: Infinity, includedCount: 0, all: true, accessible: new Set((data as { id: string }[] ?? []).map((r) => r.id)) };
  }

  const { data: ownData } = await supabase
    .from("project_access")
    .select("user_id, project_id, paid, expires_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  const own = (ownData as AccessRow[] | null) ?? [];

  if (role === "admin") {
    const quota = p?.project_quota ?? 0;
    const poolIds = own.filter((r) => !r.paid).slice(0, quota).map((r) => r.project_id);
    return { role, managed: false, base: quota, includedCount: poolIds.length, all: false, accessible: new Set(poolIds) };
  }

  // agent
  const managed = !!(p?.is_active && p?.managed_by);
  const base = managed ? 0 : (await isProTier(supabase, userId)) ? 3 : 1;
  const includedIds = own.filter((r) => !r.paid).slice(0, base).map((r) => r.project_id);
  const paidIds = own.filter((r) => r.paid && isActive(r, now)).map((r) => r.project_id);

  let poolIds: string[] = [];
  if (managed && p?.managed_by) {
    const [{ data: adminProf }, { data: poolData }] = await Promise.all([
      supabase.from("profiles").select("project_quota").eq("id", p.managed_by).maybeSingle(),
      supabase
        .from("project_access")
        .select("user_id, project_id, paid, expires_at, created_at")
        .eq("user_id", p.managed_by)
        .order("created_at", { ascending: true }),
    ]);
    const adminQuota = (adminProf as { project_quota: number | null } | null)?.project_quota ?? 0;
    poolIds = ((poolData as AccessRow[] | null) ?? []).filter((r) => !r.paid).slice(0, adminQuota).map((r) => r.project_id);
  }

  return {
    role,
    managed,
    base,
    includedCount: includedIds.length,
    all: false,
    accessible: new Set([...includedIds, ...paidIds, ...poolIds]),
  };
}

// Quick gate used by create-post / generate-script / project detail.
export async function canAccessProject(userId: string, projectId: string): Promise<boolean> {
  const st = await getAccessState(userId);
  return st.all || st.accessible.has(projectId);
}

// The user's own access rows (for expiry/renew display on the project list).
export async function listOwnAccess(
  userId: string,
): Promise<Map<string, { paid: boolean; expiresAt: string | null }>> {
  const m = new Map<string, { paid: boolean; expiresAt: string | null }>();
  if (!isSupabaseConfigured()) return m;
  const { data } = await createClient()
    .from("project_access")
    .select("project_id, paid, expires_at")
    .eq("user_id", userId);
  for (const r of (data as { project_id: string; paid: boolean; expires_at: string | null }[] | null) ?? []) {
    m.set(r.project_id, { paid: r.paid, expiresAt: r.expires_at });
  }
  return m;
}
