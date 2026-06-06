import { HOOK_BANK } from "./hooks";
import { NODE_BANK } from "./nodes";
import { RECIPES } from "./recipes";
import { COMPAT } from "./compat";
import { SLOT_REGISTRY } from "./slots";
import type { HookFamily } from "../types";

// Emit idempotent seed SQL for the library tables (0009) straight from the
// in-repo arrays, so the DB mirror can never drift from the engine's source of
// truth. Applied as migration 0010.

const q = (s: string | null | undefined): string =>
  s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`;

const pgArr = (xs: readonly (string | number)[] | undefined): string =>
  !xs || xs.length === 0 ? `'{}'` : `array[${xs.map((x) => q(String(x))).join(",")}]::text[]`;

const jsonb = (o: unknown): string => `${q(JSON.stringify(o))}::jsonb`;
const numOrNull = (n: number | undefined): string => (n == null ? "null" : String(n));

function hooksSql(): string {
  const rows = HOOK_BANK.map((h) =>
    `(${q(h.id)},${q(h.family)},${q(h.text)},${q(h.onscreen)},${q(h.visual)},` +
    `${h.duration[0]},${h.duration[1]},${h.words[0]},${h.words[1]},` +
    `${pgArr(h.requiresSlots)},${pgArr(h.optionalSlots)},${pgArr(h.promiseTags)},` +
    `${pgArr(h.toneTags)},${pgArr(h.platformFit)},${q(h.risk)},${h.weight ?? 1},${q(h.status ?? "active")})`,
  );
  return (
    "insert into hook_templates (id,family,text_template,onscreen_text,visual_directive," +
    "duration_min,duration_max,word_min,word_max,requires_slots,optional_slots,promise_tags," +
    "tone_tags,platform_fit,risk_level,weight,status) values\n" +
    rows.join(",\n") +
    "\non conflict (id) do update set family=excluded.family,text_template=excluded.text_template," +
    "onscreen_text=excluded.onscreen_text,visual_directive=excluded.visual_directive," +
    "duration_min=excluded.duration_min,duration_max=excluded.duration_max,word_min=excluded.word_min," +
    "word_max=excluded.word_max,requires_slots=excluded.requires_slots,optional_slots=excluded.optional_slots," +
    "promise_tags=excluded.promise_tags,tone_tags=excluded.tone_tags,platform_fit=excluded.platform_fit," +
    "risk_level=excluded.risk_level,weight=excluded.weight,status=excluded.status;"
  );
}

function nodesSql(): string {
  const rows = NODE_BANK.map((n) =>
    `(${q(n.id)},${q(n.type)},${q(n.text)},${q(n.onscreen)},${q(n.visual)},` +
    `${n.duration[0]},${n.duration[1]},${numOrNull(n.words?.[0])},${numOrNull(n.words?.[1])},` +
    `${pgArr(n.requiresSlots)},${pgArr(n.optionalSlots)},${q(n.deliversTag)},${q(n.funnel)},` +
    `${pgArr(n.toneTags)},${pgArr(n.platformFit)},${n.weight ?? 1},${q(n.status ?? "active")})`,
  );
  return (
    "insert into node_templates (id,node_type,text_template,onscreen_text,visual_directive," +
    "duration_min,duration_max,word_min,word_max,requires_slots,optional_slots,delivers_tag,funnel," +
    "tone_tags,platform_fit,weight,status) values\n" +
    rows.join(",\n") +
    "\non conflict (id) do update set node_type=excluded.node_type,text_template=excluded.text_template," +
    "onscreen_text=excluded.onscreen_text,visual_directive=excluded.visual_directive," +
    "duration_min=excluded.duration_min,duration_max=excluded.duration_max,word_min=excluded.word_min," +
    "word_max=excluded.word_max,requires_slots=excluded.requires_slots,optional_slots=excluded.optional_slots," +
    "delivers_tag=excluded.delivers_tag,funnel=excluded.funnel,tone_tags=excluded.tone_tags," +
    "platform_fit=excluded.platform_fit,weight=excluded.weight,status=excluded.status;"
  );
}

function recipesSql(): string {
  const rows = RECIPES.map((r) =>
    `(${q(r.id)},${q(r.nameVi)},${q(r.pillar)},${pgArr(r.preferredHooks)},${pgArr(r.allowedHooks)},` +
    `${pgArr(r.payoffTags)},${jsonb(r.chain)})`,
  );
  return (
    "insert into recipes (id,name_vi,pillar,preferred_hooks,allowed_hooks,payoff_tags,chain) values\n" +
    rows.join(",\n") +
    "\non conflict (id) do update set name_vi=excluded.name_vi,pillar=excluded.pillar," +
    "preferred_hooks=excluded.preferred_hooks,allowed_hooks=excluded.allowed_hooks," +
    "payoff_tags=excluded.payoff_tags,chain=excluded.chain;"
  );
}

function compatSql(): string {
  const rows: string[] = [];
  for (const family of Object.keys(COMPAT) as HookFamily[]) {
    for (const [recipeId, level] of Object.entries(COMPAT[family])) {
      rows.push(`(${q(family)},${q(recipeId)},${q(level)})`);
    }
  }
  return (
    "insert into compat_rules (hook_family,content_type,level) values\n" +
    rows.join(",\n") +
    "\non conflict (hook_family,content_type) do update set level=excluded.level;"
  );
}

function slotsSql(): string {
  const rows = Object.values(SLOT_REGISTRY).map((s) =>
    `(${q(s.key)},${q(s.group)},${q(s.dataType)},${q(s.sourcePath)},${q(s.formatter)},` +
    `${q(s.computed)},${q(s.fallbackText)},${s.requiresSource ? "true" : "false"})`,
  );
  return (
    "insert into slot_registry (key,slot_group,data_type,source_path,formatter,computed_formula,fallback_text,requires_source) values\n" +
    rows.join(",\n") +
    "\non conflict (key) do update set slot_group=excluded.slot_group,data_type=excluded.data_type," +
    "source_path=excluded.source_path,formatter=excluded.formatter,computed_formula=excluded.computed_formula," +
    "fallback_text=excluded.fallback_text,requires_source=excluded.requires_source;"
  );
}

export function buildSeedSql(): string {
  return [
    "-- 0010 Script Node Engine — library seed (generated from lib/script-engine/data).",
    "-- Regenerate: GEN_SEED=1 npx vitest run lib/script-engine/data/library.test.ts",
    "",
    "-- recipes must exist before compat_rules (FK).",
    recipesSql(),
    "",
    hooksSql(),
    "",
    nodesSql(),
    "",
    compatSql(),
    "",
    slotsSql(),
    "",
  ].join("\n");
}
