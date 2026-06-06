import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result, type Tier, type QuotaCheck } from "@/types/domain";

const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, team: 2 };
const FREE_DAILY = 3; // free agents: 3 combined (posts + video scripts) / day

interface ProfileGate {
  role: "agent" | "admin" | "super_admin";
  is_active: boolean;
  managed_by: string | null;
}

async function getProfileGate(userId: string): Promise<ProfileGate | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role, is_active, managed_by")
    .eq("id", userId)
    .maybeSingle();
  return (data as ProfileGate | null) ?? null;
}

// Visual tier for watermark/feature gating:
//   super_admin/admin → team, activated agent → pro, otherwise → free.
// (Daily limits are resolved separately by checkDailyQuota.)
export async function getActiveTier(userId: string): Promise<Result<Tier>> {
  if (!isSupabaseConfigured()) return ok("free");
  const p = await getProfileGate(userId);
  if (p && (p.role === "admin" || p.role === "super_admin")) return ok("team");
  if (p && p.role === "agent" && p.is_active) return ok("pro");
  // fall back to any active subscription (legacy), else free
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) return err("INTERNAL", error.message);
  const tier = (data as { tier: Tier }[]).reduce<Tier>(
    (best, r) => (TIER_RANK[r.tier] > TIER_RANK[best] ? r.tier : best),
    "free",
  );
  return ok(tier);
}

// Resolve the user's daily creation limit (null = unlimited):
//   staff → unlimited · activated agent → managing admin's daily_quota
//   (null = unlimited) · everyone else → FREE_DAILY.
async function resolveDailyLimit(userId: string): Promise<number | null> {
  const p = await getProfileGate(userId);
  if (!p) return FREE_DAILY;
  if (p.role === "admin" || p.role === "super_admin") return null;
  if (p.role === "agent" && p.is_active && p.managed_by) {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("daily_quota").eq("id", p.managed_by).maybeSingle();
    const q = (data as { daily_quota: number | null } | null)?.daily_quota;
    return q == null ? null : q; // null = unlimited
  }
  return FREE_DAILY;
}

// Combined daily usage: generated_posts + generated_scripts created today.
async function countToday(userId: string): Promise<number> {
  const supabase = createClient();
  const startOfDay = `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;
  const [posts, scripts] = await Promise.all([
    supabase.from("generated_posts").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", startOfDay),
    supabase.from("generated_scripts").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", startOfDay),
  ]);
  return (posts.count ?? 0) + (scripts.count ?? 0);
}

// Daily quota across posts + video scripts (shared counter).
export async function checkDailyQuota(userId: string): Promise<Result<QuotaCheck>> {
  if (!isSupabaseConfigured()) return ok({ allowed: true, used: 0, limit: null });
  const limit = await resolveDailyLimit(userId);
  if (limit === null) return ok({ allowed: true, used: 0, limit: null });
  const used = await countToday(userId);
  return ok({ allowed: used < limit, used, limit });
}
