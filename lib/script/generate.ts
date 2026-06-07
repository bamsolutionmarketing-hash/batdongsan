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
import { composeScriptPrompt, type ComposeNode } from "@/lib/engine/promptComposer";
import { cohesion, getAngle } from "@/lib/script-engine/data/angles";
import type { Platform, Duration, ScriptResult, Tone } from "@/lib/script-engine/types";

export interface GenerateInput {
  projectId: string;
  platform: Platform;
  durationS: Duration;
  contentType?: string; // recipe id
  attempt?: number; // regenerate ⇒ +1
  persist?: boolean; // default true
  nodeIds?: string[]; // knowledge-map nodes the agent picked (bias BODY by topic)
  angle?: string; // chosen góc nhìn (AngleId) — single through-line + cohesion check
}

// Deterministic index into a pool from a string key.
function hashIdx(s: string, n: number): number {
  if (n <= 0) return 0;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % n;
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
  const seed = hashSeed([
    userId, input.projectId, recipe.id, today.toISOString().slice(0, 10),
    input.attempt ?? 0, (input.nodeIds ?? []).join(","),
  ]);
  const selectedNodes = nodesRes.ok
    ? nodesRes.data.map((n) => {
        // Rotate among usable body variants by seed (so re-roll varies the body
        // line as more variants are authored).
        const usable = (bodyMap.get(n.id) ?? []).filter((b) => blockUsable(b, n.facts).usable);
        const pick = usable.length ? usable[hashIdx(`${seed}:bodyvar:${n.id}`, usable.length)] : undefined;
        const body = pick ? fillVars(pick.text, varCtx).text : null;
        return {
          id: n.id, category: n.category, label: n.label, talkpoint: n.talkpoint, body,
          facts: n.facts.map((f) => ({ key: f.key, value: f.value, confidence: f.confidence })),
        };
      })
    : [];

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

  // Coherence (đồng nhất) + self-contained AI prompt — built here so the agent
  // can paste it into any external LLM and get one coherent story (no AI call).
  if (result.status === "OK" && result.script) {
    const angleDef = getAngle(input.angle);
    const coh = cohesion(input.angle, selectedNodes.map((n) => ({ label: n.label, category: n.category })));
    result.cohesion = { score: coh.score, offTopic: coh.offTopic, angleId: input.angle, suggestedAngleId: coh.suggestedAngleId };

    const promptNodes: ComposeNode[] = selectedNodes.map((n) => ({
      label: n.label,
      category: n.category,
      talkpoint: n.talkpoint,
      facts: n.facts.map((f) => ({ key: f.key, value: f.value, confidence: f.confidence })),
    }));
    result.aiPrompt = composeScriptPrompt({
      platform: input.platform,
      durationS: input.durationS,
      contentTypeName: recipe.nameVi,
      projectName: project?.name ?? null,
      script: result.script,
      caption: result.caption ?? null,
      checklist: result.checklist ?? null,
      angle: angleDef ? { label: angleDef.label, guide: angleDef.guide, arc: angleDef.arc } : null,
      project: { name: project?.name ?? null },
      nodes: promptNodes.length ? promptNodes : null,
      maxPoints: 3,
    });
  }

  return result;
}
