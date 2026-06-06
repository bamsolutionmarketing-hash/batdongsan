import type {
  Recipe, Platform, Duration, SlotMap, Tone, RotationEntry, PickedNode, ScriptResult, ChainSlot,
} from "./types";
import { selectHook, selectNode, type SelectCtx } from "./selector";
import { fitBudget, WORD_TOTAL } from "./budget";
import { renderNodes, renderTwoColumn, renderCaption, renderShotlist, totalWords } from "./render";
import { runComplianceLint } from "./lint";
import { HOOK_BANK } from "./data/hooks";

export interface AssembleArgs {
  recipe: Recipe;
  platform: Platform;
  durationS: Duration;
  slots: SlotMap;
  agentTone: Tone[];
  rotation?: Map<string, RotationEntry>;
  seed: string;
  today?: Date;
  weights?: Map<string, number>; // P5 performance multipliers
  abHook?: boolean; // also surface an A/B alternate hook (default true)
}

// Ensure engine-generated FORMAT slots exist so nothing renders raw (P9).
function withFormatSlots(slots: SlotMap, durationS: Duration, bodyCount: number, today: Date): SlotMap {
  const v = { ...slots.values };
  if (!v.thoi_luong) v.thoi_luong = String(durationS);
  if (!v.so_luong) v.so_luong = String(bodyCount);
  if (!v.nam) v.nam = String(today.getFullYear());
  if (!v.thang) v.thang = String(today.getMonth() + 1);
  if (!v.ngay) v.ngay = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
  return { ...slots, values: v };
}

const hookToPicked = (h: (typeof HOOK_BANK)[number]): PickedNode => ({
  id: h.id, type: "HOOK", family: h.family, text: h.text, onscreen: h.onscreen, visual: h.visual, duration: h.duration,
});

// Full deterministic assembly (Spec 2.7). Pure: all data already resolved into
// `slots`; rotation/seed/today supplied by the caller. NO LLM, NO I/O.
export function assembleScript(args: AssembleArgs): ScriptResult {
  const { recipe, platform, durationS, agentTone, seed } = args;
  const today = args.today ?? new Date();
  const rotation = args.rotation ?? new Map<string, RotationEntry>();
  const chain: ChainSlot[] = recipe.chain[durationS] ?? recipe.chain[30] ?? [];
  const bodyCount = chain.filter((c) => c.type.startsWith("BODY_")).length;
  const slots = withFormatSlots(args.slots, durationS, bodyCount, today);

  const ctx: SelectCtx = { recipe, platform, slots, agentTone, rotation, seed, today, weights: args.weights };

  // 1. HOOK
  const hookRes = selectHook(ctx);
  if (!hookRes.chosen) {
    return { status: "MISSING_SLOTS", missingSlots: hookRes.missingFromPool };
  }
  const picked: PickedNode[] = [hookToPicked(hookRes.chosen)];

  // 1b. A/B alternate hook (different from the chosen one).
  let altHook: ScriptResult["altHook"];
  if (args.abHook !== false) {
    const alt = selectHook({ ...ctx, exclude: new Set([hookRes.chosen.id]), seed: `${seed}:alt` }).chosen;
    if (alt) altHook = { id: alt.id, family: alt.family, text: alt.text, onscreen: alt.onscreen, visual: alt.visual };
  }

  // 2. CHAIN
  chain.forEach((slot, i) => {
    const node = selectNode(slot.type, ctx, i + 1, slot.deliversTag);
    if (node) {
      picked.push({
        id: node.id, type: node.type, text: node.text,
        onscreen: node.onscreen ?? "", visual: node.visual, duration: node.duration,
      });
    }
  });

  // 3. BUDGET FIT (R2)
  const budget = fitBudget(picked, durationS);

  // 4. RENDER
  const rendered = renderNodes(budget.items, slots);

  // 5. COMPLIANCE LINT (R10)
  const lint = runComplianceLint(rendered, slots);

  // 6. VIEWS
  const script = renderTwoColumn(rendered);
  const caption = renderCaption(rendered, slots);
  const checklist = renderShotlist(rendered);

  // 7. R3 word-budget warning (non-blocking).
  const words = totalWords(rendered);
  const [, wordMax] = WORD_TOTAL[durationS] ?? [0, 9999];
  if (words > wordMax * 1.1) {
    lint.warnings.push({
      rule: "R3:word_budget",
      match: `${words} từ`,
      where: "script",
      message: `Vượt ngân sách từ (${wordMax} ± 10%) cho ${durationS}s.`,
    });
  }

  const meta = {
    seed,
    recipeId: recipe.id,
    hookId: hookRes.chosen.id,
    nodeIds: rendered.map((n) => n.id),
    slotSnapshot: slots.values,
    platform,
    durationS,
  };

  return {
    status: lint.hardBlocks.length ? "BLOCKED" : "OK",
    script,
    caption,
    checklist,
    lint,
    altHook,
    meta,
  };
}
