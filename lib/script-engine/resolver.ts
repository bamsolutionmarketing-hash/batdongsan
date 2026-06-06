import { getProjectById } from "@/lib/repo/projects";
import { getBranding } from "@/lib/repo/branding";
import { getProjectScriptFacts, getMarketFacts } from "@/lib/repo/scripts";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { SlotMap } from "./types";
import { SLOT_REGISTRY, ALWAYS_AVAILABLE, slotDef } from "./data/slots";
import { applyFormatter, fmt_trieu } from "./formatters";

const isNumeric = (s: string) => /^-?[\d.,]+$/.test(s.trim());

// Apply the registry formatter when the raw value is a bare number; otherwise
// keep the author's text as-is (they may have typed "68m²" already).
function fmtVal(key: string, raw: string): string {
  const f = slotDef(key)?.formatter;
  if (f && isNumeric(raw)) return applyFormatter(f, raw.replace(/,/g, ""));
  return raw;
}

// Resolve a project+agent into a SlotMap (R8 fallback chain). Server-only:
// reads project/developer/branding + per-agent slot & market facts.
export async function resolveSlots(userId: string, projectId: string): Promise<SlotMap> {
  const values: Record<string, string> = {};
  const meta: SlotMap["meta"] = {};

  const [projRes, brandingRes, factsRes] = await Promise.all([
    getProjectById(projectId),
    getBranding(userId),
    getProjectScriptFacts(userId, projectId),
  ]);

  const project = projRes.ok ? projRes.data : null;
  const branding = brandingRes.ok ? brandingRes.data : null;

  // ── project columns ──
  if (project) {
    if (project.name) values.du_an = project.name;
    if (project.locationText) values.khu_vuc = project.locationText;
    if (project.priceMin != null) values.gia_tu = applyFormatter("fmt_ty", project.priceMin);
    if (project.priceMax != null) values.gia_max = applyFormatter("fmt_ty", project.priceMax);
    // developer name → cdt
    if (project.developerId && isSupabaseConfigured()) {
      const { data } = await createClient().from("developers").select("name").eq("id", project.developerId).maybeSingle();
      if (data?.name) values.cdt = data.name as string;
    }
  }

  // ── agent (branding) ──
  if (branding) {
    if (branding.displayName) values.ten_sale = branding.displayName;
    if (branding.soNamKn != null) values.so_nam_kn = String(branding.soNamKn);
    if (branding.soGiaoDich != null) values.so_giao_dich = String(branding.soGiaoDich);
    if (branding.khuVucChuyen) values.khu_vuc_chuyen = branding.khuVucChuyen;
    if (branding.kenhDat) values.kenh_dat = branding.kenhDat;
  }

  // ── per-agent project slot overrides (highest priority for project slots) ──
  if (factsRes.ok) {
    for (const f of factsRes.data) {
      values[f.key] = fmtVal(f.key, f.value);
      if (f.source || f.validUntil) meta[f.key] = { source: f.source ?? undefined, validUntil: f.validUntil ?? undefined };
    }
  }

  // ── market facts (carry source — R5) ──
  const marketRes = await getMarketFacts(userId, values.khu_vuc ?? "");
  if (marketRes.ok) {
    for (const f of marketRes.data) {
      values[f.key] = fmtVal(f.key, f.value);
      meta[f.key] = { source: f.source ?? undefined, validUntil: f.validUntil ?? undefined };
    }
  }

  // ── computed: gia_m2 = price / area ──
  if (!values.gia_m2 && project?.priceMin != null && values.dien_tich) {
    const area = Number(values.dien_tich.replace(/[^\d.]/g, ""));
    if (area > 0) values.gia_m2 = fmt_trieu(project.priceMin / area);
  }

  // ── missing = registry data slots with no value, no fallback, not always-on ──
  const missing: string[] = [];
  for (const [key, def] of Object.entries(SLOT_REGISTRY)) {
    if (ALWAYS_AVAILABLE.has(key)) continue;
    if (values[key] != null && values[key] !== "") continue;
    if (def.fallbackText) continue; // R8 step 3 resolves it
    missing.push(key);
  }

  return { values, missing, meta };
}
