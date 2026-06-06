import type {
  Recipe, Platform, Duration, SlotMap, Tone, RotationEntry, PickedNode, ScriptResult, ChainSlot, NodeType,
} from "./types";
import { selectHook, selectNode, type SelectCtx } from "./selector";
import { fitBudget, WORD_TOTAL } from "./budget";
import { renderNodes, renderTwoColumn, renderCaption, renderShotlist, totalWords } from "./render";
import { runComplianceLint } from "./lint";
import { HOOK_BANK } from "./data/hooks";

// A knowledge-map node the agent picked, to drive a BODY segment.
export interface SelectedNode {
  id: string;
  category: string;
  label: string;
  talkpoint?: string | null;
  facts?: { key: string; value: string; confidence?: string }[];
}

// Map a knowledge-node category → the BODY/PROOF template type that best fits
// its topic. Unmapped categories keep the recipe position's own type.
const CATEGORY_TO_BODY: Record<string, Exclude<NodeType, "HOOK">> = {
  finance: "BODY_DATA",
  comparable: "BODY_COMPARE",
  amenity: "BODY_DEMO", masterplan: "BODY_DEMO", cluster: "BODY_DEMO", zone: "BODY_DEMO",
  location: "BODY_POINT", metro: "BODY_POINT", road: "BODY_POINT", infra: "BODY_POINT",
  selling_point: "BODY_POINT", project: "BODY_POINT", concept: "BODY_POINT",
  event: "BODY_STORY",
  legal: "BODY_OBJECTION", policy: "BODY_OBJECTION",
  cert: "PROOF", developer: "PROOF", brand: "PROOF", partner: "PROOF", group: "PROOF",
};

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
  selectedNodes?: SelectedNode[]; // bias BODY positions by chosen map nodes
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

// Turn a picked knowledge-map node into a BODY segment: speech from the node's
// talkpoint (+ a verified fact), overlay = label. Author-written content, so it
// carries the node's real substance into the script (no template filler).
function nodeToSegment(n: SelectedNode): PickedNode {
  const tp = (n.talkpoint ?? "").trim().replace(/^["“”']+|["“”']+$/g, "").trim();
  const verified = (n.facts ?? []).filter((f) => (f.confidence ?? "verified") === "verified");
  const top = verified[0];
  const factClause = top ? `${top.key}: ${top.value}` : "";
  const speech = tp || (factClause ? `${n.label} — ${factClause}` : n.label);
  const words = speech.split(/\s+/).filter(Boolean).length;
  const secs = Math.min(8, Math.max(3, Math.round(words / 2.5)));
  return {
    id: `KN-${n.id.slice(0, 8)}`,
    type: CATEGORY_TO_BODY[n.category] ?? "BODY_POINT",
    text: speech,
    onscreen: top ? `${n.label} · ${top.value}` : n.label,
    visual: `Hình minh hoạ: ${n.label}`,
    duration: [secs, secs],
  };
}

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

  // 2. CHAIN. When the agent picked map nodes, each node becomes a BODY segment
  // (talkpoint + verified fact as speech). Node count is free — the body run is
  // replaced by the chosen nodes; budget fit (R2) trims if too long. Non-BODY
  // positions (CTX/PROOF/PAYOFF/CTA/LOOP) keep their templates. A soft warning
  // is surfaced when the node count differs from the recipe's body count.
  const sel = args.selectedNodes;
  const useNodes = !!(sel && sel.length > 0);
  const nodeWarning =
    useNodes && sel!.length !== bodyCount
      ? `Recipe “${recipe.nameVi}” ${durationS}s gợi ý ${bodyCount} đoạn; bạn chọn ${sel!.length} điểm — kịch bản tự co (có thể cắt bớt khi quá dài).`
      : null;

  let nodesInserted = false;
  chain.forEach((slot, i) => {
    const isBody = slot.type.startsWith("BODY_");
    if (useNodes && isBody) {
      if (!nodesInserted) {
        for (const n of sel!) picked.push(nodeToSegment(n));
        nodesInserted = true;
      }
      return; // node segments replace the template body run
    }
    const node2 = selectNode(slot.type, ctx, i + 1, slot.deliversTag);
    if (node2) {
      picked.push({
        id: node2.id, type: node2.type, text: node2.text,
        onscreen: node2.onscreen ?? "", visual: node2.visual, duration: node2.duration,
      });
    }
  });

  // 3. BUDGET FIT (R2)
  const budget = fitBudget(picked, durationS);

  // 4. RENDER
  const rendered = renderNodes(budget.items, slots);

  // 5. COMPLIANCE LINT (R10)
  const lint = runComplianceLint(rendered, slots);
  if (nodeWarning) {
    lint.warnings.push({ rule: "NODES:count", match: `${sel!.length}/${bodyCount}`, where: "chain", message: nodeWarning });
  }

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
