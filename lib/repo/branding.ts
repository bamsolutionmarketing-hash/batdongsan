import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result, type AgentBranding } from "@/types/domain";

interface BrandingRow {
  user_id: string;
  display_name: string;
  phone: string;
  zalo: string | null;
  logo_path: string | null;
  position: string;
  so_nam_kn: number | null;
  so_giao_dich: number | null;
  khu_vuc_chuyen: string | null;
  kenh_dat: string | null;
  tone_profile: string[] | null;
}

const toBranding = (r: BrandingRow): AgentBranding => ({
  userId: r.user_id,
  displayName: r.display_name,
  phone: r.phone,
  zalo: r.zalo,
  logoPath: r.logo_path,
  position: r.position,
  soNamKn: r.so_nam_kn,
  soGiaoDich: r.so_giao_dich,
  khuVucChuyen: r.khu_vuc_chuyen,
  kenhDat: r.kenh_dat,
  toneProfile: (r.tone_profile?.length ? r.tone_profile : ["chuyen_gia", "than_thien"]) as AgentBranding["toneProfile"],
});

// The caller's branding (RLS own-row), or null if not set up yet.
export async function getBranding(userId: string): Promise<Result<AgentBranding | null>> {
  if (!isSupabaseConfigured()) return ok(null);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("agent_branding")
    .select("user_id, display_name, phone, zalo, logo_path, position, so_nam_kn, so_giao_dich, khu_vuc_chuyen, kenh_dat, tone_profile")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return err("INTERNAL", error.message);
  return ok(data ? toBranding(data as BrandingRow) : null);
}
