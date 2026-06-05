import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result, type AgentBranding } from "@/types/domain";

interface BrandingRow {
  user_id: string;
  display_name: string;
  phone: string;
  zalo: string | null;
  logo_path: string | null;
  position: string;
}

const toBranding = (r: BrandingRow): AgentBranding => ({
  userId: r.user_id,
  displayName: r.display_name,
  phone: r.phone,
  zalo: r.zalo,
  logoPath: r.logo_path,
  position: r.position,
});

// The caller's branding (RLS own-row), or null if not set up yet.
export async function getBranding(userId: string): Promise<Result<AgentBranding | null>> {
  if (!isSupabaseConfigured()) return ok(null);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_branding")
    .select("user_id, display_name, phone, zalo, logo_path, position")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return err("INTERNAL", error.message);
  return ok(data ? toBranding(data as BrandingRow) : null);
}
