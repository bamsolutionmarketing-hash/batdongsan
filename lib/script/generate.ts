import { resolveSlots } from "@/lib/script-engine/resolver";
import { assembleScript } from "@/lib/script-engine/assemble";
import { getRecipe, RECIPES } from "@/lib/script-engine/data/recipes";
import { hashSeed } from "@/lib/script-engine/seed";
import { getRotation, bumpRotation, saveScript, getTemplateWeights } from "@/lib/repo/scripts";
import { getBranding as getBrandingRepo } from "@/lib/repo/branding";
import { nodesByIds } from "@/lib/repo/nodes";
import { bodyBlocksByNodes } from "@/lib/repo/blocks";
import { getProjectById } from "@/lib/repo/projects";
import { blockUsable } from "@/lib/engine/compliance";
import { substitute as fillVars } from "@/lib/engine/variables";
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

  const hasNodes = !!input.nodeIds?.length;
  const [slots, brandingRes, rotationRes, weightsRes, nodesRes, blocksRes, projRes] = await Promise.all([
    resolveSlots(userId, input.projectId),
    getBrandingRepo(userId),
    getRotation(userId),
    getTemplateWeights(userId),
    hasNodes ? nodesByIds(input.nodeIds!) : Promise.resolve({ ok: true as const, data: [] }),
    hasNodes ? bodyBlocksByNodes(input.nodeIds!) : Promise.resolve({ ok: true as const, data: new Map() }),
    hasNodes ? getProjectById(input.projectId) : Promise.resolve({ ok: true as const, data: null }),
  ]);

  const branding = brandingRes.ok ? brandingRes.data : null;
  const agentTone: Tone[] = (branding?.toneProfile?.length ? branding.toneProfile : ["chuyen_gia", "than_thien"]) as Tone[];
  const rotation = rotationRes.ok ? rotationRes.data : new Map();
  const weights = weightsRes.ok ? weightsRes.data : new Map();

  // Build each picked node's body line from the Super-Admin-authored content
  // blocks (role=body): pick the first compliance-usable variant and fill
  // [TOKEN]s. Falls back to talkpoint in the engine; nodes with neither are
  // skipped (no junk segment). Preserves the agent's chosen order.
  const bodyMap = (blocksRes.ok ? blocksRes.data : new Map()) as Map<string, import("@/types/domain").ContentBlock[]>;
  const project = projRes.ok ? projRes.data : null;
  const varCtx = {
    branding: { displayName: branding?.displayName, phone: branding?.phone, zalo: branding?.zalo },
    project: { name: project?.name, view360Url: project?.view360Url },
  };
  const selectedNodes = nodesRes.ok
    ? nodesRes.data.map((n) => {
        const usable = (bodyMap.get(n.id) ?? []).find((b) => blockUsable(b, n.facts).usable);
        const body = usable ? fillVars(usable.text, varCtx).text : null;
        return {
          id: n.id, category: n.category, label: n.label, talkpoint: n.talkpoint, body,
          facts: n.facts.map((f) => ({ key: f.key, value: f.value, confidence: f.confidence })),
        };
      })
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
