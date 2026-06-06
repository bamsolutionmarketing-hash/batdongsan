import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ok, err, type Result } from "@/types/domain";
import type { RotationEntry } from "@/lib/script-engine/types";

// ── slot facts (project_script_facts) ──────────────────────────────────────
export interface SlotFact {
  key: string;
  value: string;
  source: string | null;
  validUntil: string | null;
}

export async function getProjectScriptFacts(userId: string, projectId: string): Promise<Result<SlotFact[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("project_script_facts")
    .select("key, value, source, valid_until")
    .eq("user_id", userId)
    .eq("project_id", projectId);
  if (error) return err("INTERNAL", error.message);
  return ok((data ?? []).map((r) => ({ key: r.key, value: String(r.value), source: r.source, validUntil: r.valid_until })));
}

export async function upsertProjectScriptFact(
  userId: string, projectId: string, key: string, value: string, source?: string | null, validUntil?: string | null,
): Promise<Result<true>> {
  if (!isSupabaseConfigured()) return err("INTERNAL", "Supabase chưa cấu hình");
  const supabase = createClient();
  const { error } = await supabase.from("project_script_facts").upsert({
    user_id: userId, project_id: projectId, key, value, source: source ?? null, valid_until: validUntil ?? null, updated_at: new Date().toISOString(),
  });
  if (error) return err("INTERNAL", error.message);
  return ok(true);
}

// ── market facts (requires source — R5) ────────────────────────────────────
export async function getMarketFacts(userId: string, khuVuc = ""): Promise<Result<SlotFact[]>> {
  if (!isSupabaseConfigured()) return ok([]);
  const supabase = createClient();
  const { data, error } = await supabase
    .from("market_facts")
    .select("khu_vuc, key, value, source, valid_until")
    .eq("user_id", userId)
    .in("khu_vuc", Array.from(new Set([khuVuc, ""])));
  if (error) return err("INTERNAL", error.message);
  // prefer region-specific over global ('') when both exist
  const byKey = new Map<string, SlotFact>();
  for (const r of data ?? []) {
    const cur = byKey.get(r.key);
    if (!cur || r.khu_vuc === khuVuc) byKey.set(r.key, { key: r.key, value: String(r.value), source: r.source, validUntil: r.valid_until });
  }
  return ok([...byKey.values()]);
}

export async function upsertMarketFact(
  userId: string, khuVuc: string, key: string, value: string, source: string, validUntil?: string | null,
): Promise<Result<true>> {
  if (!isSupabaseConfigured()) return err("INTERNAL", "Supabase chưa cấu hình");
  const supabase = createClient();
  const { error } = await supabase.from("market_facts").upsert({
    user_id: userId, khu_vuc: khuVuc, key, value, source, valid_until: validUntil ?? null, updated_at: new Date().toISOString(),
  });
  if (error) return err("INTERNAL", error.message);
  return ok(true);
}

// ── rotation state (R4) ─────────────────────────────────────────────────────
export async function getRotation(userId: string): Promise<Result<Map<string, RotationEntry>>> {
  if (!isSupabaseConfigured()) return ok(new Map());
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rotation_state")
    .select("template_id, last_used_at, use_count")
    .eq("user_id", userId);
  if (error) return err("INTERNAL", error.message);
  const map = new Map<string, RotationEntry>();
  for (const r of data ?? []) map.set(r.template_id, { templateId: r.template_id, lastUsedAt: r.last_used_at, useCount: r.use_count });
  return ok(map);
}

export async function bumpRotation(userId: string, templateIds: string[]): Promise<Result<true>> {
  if (!isSupabaseConfigured() || templateIds.length === 0) return ok(true);
  const supabase = createClient();
  const now = new Date().toISOString();
  // read existing counts to increment
  const { data } = await supabase.from("rotation_state").select("template_id, use_count").eq("user_id", userId).in("template_id", templateIds);
  const counts = new Map((data ?? []).map((r) => [r.template_id, r.use_count as number]));
  const rows = templateIds.map((id) => ({ user_id: userId, template_id: id, last_used_at: now, use_count: (counts.get(id) ?? 0) + 1 }));
  const { error } = await supabase.from("rotation_state").upsert(rows);
  if (error) return err("INTERNAL", error.message);
  return ok(true);
}

// ── generated scripts log ───────────────────────────────────────────────────
export interface SaveScriptInput {
  userId: string;
  projectId: string;
  recipeId: string;
  hookId: string;
  nodeIds: string[];
  seed: string;
  slotSnapshot: Record<string, string>;
  output: unknown;
  lintWarnings: unknown;
  platform: string;
  durationS: number;
}

export async function saveScript(input: SaveScriptInput): Promise<Result<{ id: string }>> {
  if (!isSupabaseConfigured()) return err("INTERNAL", "Supabase chưa cấu hình");
  const supabase = createClient();
  const { data, error } = await supabase
    .from("generated_scripts")
    .insert({
      user_id: input.userId, project_id: input.projectId, recipe_id: input.recipeId, hook_id: input.hookId,
      node_ids: input.nodeIds, seed: input.seed, slot_snapshot: input.slotSnapshot, output: input.output,
      lint_warnings: input.lintWarnings, platform: input.platform, duration_s: input.durationS,
    })
    .select("id")
    .single();
  if (error) return err("INTERNAL", error.message);
  return ok({ id: (data as { id: string }).id });
}
