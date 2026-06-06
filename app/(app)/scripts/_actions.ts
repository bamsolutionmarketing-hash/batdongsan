"use server";

import { requireSession } from "@/lib/auth";
import { generateScript, type GenerateInput } from "@/lib/script/generate";
import { upsertProjectScriptFact, upsertMarketFact, ingestPerformance, type PerfMetrics } from "@/lib/repo/scripts";
import { checkDailyQuota } from "@/lib/gate/tier";
import type { ScriptResult, Platform, Duration } from "@/lib/script-engine/types";

export interface GenerateArgs {
  projectId: string;
  platform: Platform;
  durationS: Duration;
  contentType?: string;
  attempt?: number;
  nodeIds?: string[];
}

// Assemble a script for the current agent. Returns a serializable ScriptResult.
export async function generateScriptAction(args: GenerateArgs): Promise<ScriptResult> {
  const session = await requireSession();
  // Daily quota is shared with posts (free = 3/day combined).
  const quota = await checkDailyQuota(session.userId);
  if (quota.ok && !quota.data.allowed) {
    return {
      status: "BLOCKED",
      lint: {
        hardBlocks: [{
          rule: "QUOTA:daily",
          match: `${quota.data.used}/${quota.data.limit}`,
          where: "quota",
          message: `Hết lượt hôm nay (${quota.data.used}/${quota.data.limit}) — gồm cả bài đăng & kịch bản. Liên hệ admin để nâng cấp.`,
        }],
        warnings: [],
      },
    };
  }
  const input: GenerateInput = {
    projectId: args.projectId,
    platform: args.platform,
    durationS: args.durationS,
    contentType: args.contentType,
    attempt: args.attempt,
    nodeIds: args.nodeIds,
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

// Ingest performance for a generated script (P5; manual entry for now). RLS
// ensures the script belongs to the caller.
export async function ingestPerformanceAction(scriptId: string, metrics: PerfMetrics): Promise<{ ok: boolean; error?: string }> {
  await requireSession();
  const r = await ingestPerformance(scriptId, metrics);
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}
