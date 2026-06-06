"use server";

import { requireSession } from "@/lib/auth";
import { generateScript, type GenerateInput } from "@/lib/script/generate";
import { upsertProjectScriptFact, upsertMarketFact } from "@/lib/repo/scripts";
import type { ScriptResult, Platform, Duration } from "@/lib/script-engine/types";

export interface GenerateArgs {
  projectId: string;
  platform: Platform;
  durationS: Duration;
  contentType?: string;
  attempt?: number;
}

// Assemble a script for the current agent. Returns a serializable ScriptResult.
export async function generateScriptAction(args: GenerateArgs): Promise<ScriptResult> {
  const session = await requireSession();
  const input: GenerateInput = {
    projectId: args.projectId,
    platform: args.platform,
    durationS: args.durationS,
    contentType: args.contentType,
    attempt: args.attempt,
  };
  return generateScript(session.userId, input);
}

// Fill missing project slots (then the caller regenerates).
export async function saveSlotFactsAction(
  projectId: string,
  entries: { key: string; value: string }[],
): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  for (const e of entries) {
    if (!e.value.trim()) continue;
    const r = await upsertProjectScriptFact(session.userId, projectId, e.key, e.value.trim());
    if (!r.ok) return { ok: false, error: r.error };
  }
  return { ok: true };
}

// Add/update a market datum (source required — R5).
export async function saveMarketFactAction(args: {
  khuVuc: string;
  key: string;
  value: string;
  source: string;
  validUntil?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  if (!args.source.trim()) return { ok: false, error: "Bắt buộc có nguồn (R5)." };
  const r = await upsertMarketFact(session.userId, args.khuVuc.trim(), args.key.trim(), args.value.trim(), args.source.trim(), args.validUntil || null);
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}
