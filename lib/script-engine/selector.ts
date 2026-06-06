import type {
  HookTemplate, NodeTemplate, Recipe, Tone, Platform, PromiseTag, SlotMap, RotationEntry, NodeType,
} from "./types";
import { HOOK_BANK } from "./data/hooks";
import { NODE_BANK } from "./data/nodes";
import { compatLevel } from "./data/compat";
import { ALWAYS_AVAILABLE } from "./data/slots";
import { hashSeed, rng, seededPick } from "./seed";

// Cooldown windows in days (R4): HOOK 14, CTA 7, others 5.
const COOLDOWN_DAYS: Partial<Record<NodeType, number>> = { HOOK: 14, CTA: 7 };
const DEFAULT_COOLDOWN = 5;

export interface SelectCtx {
  recipe: Recipe;
  platform: Platform;
  slots: SlotMap;
  agentTone: Tone[];
  rotation: Map<string, RotationEntry>;
  seed: string;
  today: Date;
  weights?: Map<string, number>; // P5 performance multiplier by template id
  exclude?: Set<string>; // template ids to skip (A/B alternate hook)
}

// Effective pick weight = template weight × performance multiplier (P5).
const wOf = (id: string, base: number | undefined, ctx: SelectCtx): number =>
  (base ?? 1) * (ctx.weights?.get(id) ?? 1);

// A node/hook is slot-eligible when none of its required data slots are missing
// (R5/R8). Format slots the engine always provides never gate.
function slotsOk(requires: string[] | undefined, slots: SlotMap): boolean {
  if (!requires?.length) return true;
  return requires.every((s) => ALWAYS_AVAILABLE.has(s) || !slots.missing.includes(s));
}

const toneOk = (tags: Tone[] | undefined, agent: Tone[]): boolean =>
  !tags || tags.length === 0 || tags.some((t) => agent.includes(t));

const platformOk = (fit: Platform[] | undefined, p: Platform): boolean =>
  !fit || fit.length === 0 || fit.includes(p);

function daysSince(iso: string, today: Date): number {
  const t = new Date(iso).getTime();
  return (today.getTime() - t) / 86_400_000;
}

// On cooldown if used more recently than the window for its type (R4).
function onCooldown(id: string, type: NodeType, rotation: Map<string, RotationEntry>, today: Date): boolean {
  const e = rotation.get(id);
  if (!e) return false;
  const window = COOLDOWN_DAYS[type] ?? DEFAULT_COOLDOWN;
  return daysSince(e.lastUsedAt, today) < window;
}

const promiseMatch = (hook: HookTemplate, payoffTags: PromiseTag[]): boolean =>
  hook.promiseTags.some((t) => payoffTags.includes(t));

export interface SelectResult<T> {
  chosen: T | null;
  // required-but-missing slots across the compat/promise-eligible pool (for
  // MISSING_SLOTS surfacing when nothing could be selected).
  missingFromPool: string[];
}

// HOOK selection: compat (preferred → allowed) → R1 promise → R6 tone →
// R7 platform → slot availability → R4 cooldown → seeded weighted pick.
export function selectHook(ctx: SelectCtx): SelectResult<HookTemplate> {
  const { recipe, platform, slots, agentTone, rotation, seed, today } = ctx;
  const base = HOOK_BANK.filter(
    (h) =>
      (h.status ?? "active") === "active" &&
      !ctx.exclude?.has(h.id) &&
      compatLevel(h.family, recipe.id) !== "blocked" &&
      promiseMatch(h, recipe.payoffTags) &&
      toneOk(h.toneTags, agentTone) &&
      platformOk(h.platformFit, platform),
  );

  // Slots that block otherwise-eligible hooks → surfaced if pool ends empty.
  const missingFromPool = Array.from(
    new Set(
      base.flatMap((h) => (h.requiresSlots ?? []).filter((s) => !ALWAYS_AVAILABLE.has(s) && slots.missing.includes(s))),
    ),
  );

  const eligible = base.filter((h) => slotsOk(h.requiresSlots, slots));
  if (eligible.length === 0) return { chosen: null, missingFromPool };

  const rand = rng(hashSeed([seed, "HOOK", recipe.id]));
  // Two-tier: prefer ● over ○. Within a tier, drop cooldown unless that empties it.
  for (const wantPreferred of [true, false]) {
    const tier = eligible.filter(
      (h) => (compatLevel(h.family, recipe.id) === "preferred") === wantPreferred,
    );
    if (tier.length === 0) continue;
    let pool = tier.filter((h) => !onCooldown(h.id, "HOOK", rotation, today));
    if (pool.length === 0) pool = tier; // R4: relax cooldown rather than fail
    const chosen = seededPick(pool.map((h) => ({ item: h, weight: wOf(h.id, h.weight, ctx) })), rand);
    if (chosen) return { chosen, missingFromPool };
  }
  return { chosen: null, missingFromPool };
}

// NODE selection for one chain position. PAYOFF positions filter by deliversTag
// (R1); list_complete and best are interchangeable.
export function selectNode(
  type: Exclude<NodeType, "HOOK">,
  ctx: SelectCtx,
  position: number,
  deliversTag?: PromiseTag,
): NodeTemplate | null {
  const { platform, slots, agentTone, rotation, seed, today } = ctx;
  const eligible = NODE_BANK.filter((n) => {
    if (n.type !== type || (n.status ?? "active") !== "active") return false;
    if (type === "PAYOFF" && deliversTag) {
      const ok = n.deliversTag === deliversTag ||
        ([deliversTag, n.deliversTag].every((t) => t === "list_complete" || t === "best"));
      if (!ok) return false;
    }
    return toneOk(n.toneTags, agentTone) && platformOk(n.platformFit, platform) && slotsOk(n.requiresSlots, slots);
  });
  if (eligible.length === 0) return null;

  const rand = rng(hashSeed([seed, type, position, deliversTag ?? ""]));
  let pool = eligible.filter((n) => !onCooldown(n.id, type, rotation, today));
  if (pool.length === 0) pool = eligible;
  return seededPick(pool.map((n) => ({ item: n, weight: wOf(n.id, n.weight, ctx) })), rand);
}
