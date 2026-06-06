import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result, type Tier, type QuotaCheck } from "@/types/domain";

// Daily "tạo bài" limits per tier (null = unlimited). Mirrors §10 of the guide.
const POST_LIMIT: Record<Tier, number | null> = { free: 3, pro: 50, team: 50 };
const TIER_RANK: Record<Tier, number> = { free: 0, pro: 1, team: 2 };

// Highest active tier for the user (defaults to free when no active sub).
export async function getActiveTier(userId: string): Promise<Result<Tier>> {
  if (!isSupabaseConfigured()) return ok("free");
  const supabase = createClient();
  // Admins always get the top tier (every feature unlocked, no watermark).
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if ((prof as { role?: string } | null)?.role === "admin") return ok("team");
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

// How many posts the user has created today vs their tier limit.
export async function checkPostQuota(userId: string, tier: Tier): Promise<Result<QuotaCheck>> {
  const limit = POST_LIMIT[tier];
  if (limit === null) return ok({ allowed: true, used: 0, limit: null });
  if (!isSupabaseConfigured()) return ok({ allowed: true, used: 0, limit });
  const supabase = createClient();
  // Admins are unlimited (no daily cap).
  const { data: prof } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if ((prof as { role?: string } | null)?.role === "admin") return ok({ allowed: true, used: 0, limit: null });
  const startOfDay = `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;
  const { count, error } = await supabase
    .from("generated_posts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay);
  if (error) return err("INTERNAL", error.message);
  const used = count ?? 0;
  return ok({ allowed: used < limit, used, limit });
}
