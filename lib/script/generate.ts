import { resolveSlots } from "@/lib/script-engine/resolver";
import { assembleScript } from "@/lib/script-engine/assemble";
import { getRecipe, RECIPES } from "@/lib/script-engine/data/recipes";
import { hashSeed } from "@/lib/script-engine/seed";
import { getRotation, bumpRotation, saveScript, getTemplateWeights } from "@/lib/repo/scripts";
import { getBranding as getBrandingRepo } from "@/lib/repo/branding";
import { nodesByIds } from "@/lib/repo/nodes";
import type { Platform, Duration, ScriptResult, Tone } from "@/lib/script-engine/types";

export interface GenerateInput {
  projectId: string;
  platform: Platform;
  durationS: Duration;
  contentType?: string; // recipe id
  attempt?: number; // regenerate ⇒ +1
  persist?: boolean; // default true
  nodeIds?: string[]; // knowledge-map nodes the agent picked (bias BODY by topic)
}

// End-to-end script generation for an agent. Deterministic given the same
// (user, project, recipe, date, attempt). Persists the log + bumps rotation.
export async function generateScript(userId: string, input: GenerateInput): Promise<ScriptResult> {
  const recipe = getRecipe(input.contentType ?? "") ?? RECIPES[0];
  const today = new Date();

  const [slots, brandingRes, rotationRes, weightsRes, nodesRes] = await Promise.all([
    resolveSlots(userId, input.projectId),
    getBrandingRepo(userId),
    getRotation(userId),
    getTemplateWeights(userId),
    input.nodeIds?.length ? nodesByIds(input.nodeIds) : Promise.resolve({ ok: true as const, data: [] }),
  ]);

  const branding = brandingRes.ok ? brandingRes.data : null;
  const agentTone: Tone[] = (branding?.toneProfile?.length ? branding.toneProfile : ["chuyen_gia", "than_thien"]) as Tone[];
  const rotation = rotationRes.ok ? rotationRes.data : new Map();
  const weights = weightsRes.ok ? weightsRes.data : new Map();
  // Preserve the agent's chosen order (nodesByIds already returns input order).
  const selectedNodes = nodesRes.ok
    ? nodesRes.data.map((n) => ({ id: n.id, category: n.category, label: n.label }))
    : [];

  const seed = hashSeed([
    userId, input.projectId, recipe.id, today.toISOString().slice(0, 10),
    input.attempt ?? 0, (input.nodeIds ?? []).join(","),
  ]);

  const result = assembleScript({
    recipe, platform: input.platform, durationS: input.durationS,
    slots, agentTone, rotation, seed, today, weights, selectedNodes,
  });

  if (result.status !== "MISSING_SLOTS" && input.persist !== false && result.meta) {
    const saved = await saveScript({
      userId, projectId: input.projectId, recipeId: result.meta.recipeId, hookId: result.meta.hookId,
      nodeIds: result.meta.nodeIds, seed, slotSnapshot: result.meta.slotSnapshot,
      output: { script: result.script, caption: result.caption, checklist: result.checklist },
      lintWarnings: result.lint?.warnings ?? [], platform: input.platform, durationS: input.durationS,
    });
    if (saved.ok) result.meta.scriptId = saved.data.id;
    if (result.status === "OK") {
      await bumpRotation(userId, [result.meta.hookId, ...result.meta.nodeIds]);
    }
  }

  return result;
}
