// Script Node Engine — core types (Spec v1.0). Deterministic assembly; no LLM
// at runtime. See scriptnodeenginespec.md.

export type Platform = "tiktok" | "reels" | "shorts";
export type Duration = 15 | 30 | 60 | 90 | 120 | 180;

export type NodeType =
  | "HOOK"
  | "CTX"
  | "BODY_POINT"
  | "BODY_DATA"
  | "BODY_STORY"
  | "BODY_DEMO"
  | "BODY_COMPARE"
  | "BODY_OBJECTION"
  | "PROOF"
  | "PAYOFF"
  | "CTA"
  | "LOOP";

export type HookFamily =
  | "FAQ" | "CMP" | "DAT" | "EMO" | "RVL" | "POV" | "TRD" | "LUX"
  | "PRC" | "TIP" | "LST" | "QUE" | "DIR" | "MYT" | "FOMO" | "MIR";

// promise/payoff contract tags (R1). "best" is an alias used by some PAYOFFs.
export type PromiseTag =
  | "reveal" | "answer" | "list_complete" | "verdict"
  | "transformation" | "proof" | "experience" | "best" | "twist";

// Reuse the app's ComposeTone values (chuyen_gia | than_thien | ke_chuyen).
export type Tone = "chuyen_gia" | "than_thien" | "ke_chuyen";
export type RiskLevel = "low" | "medium" | "high";
export type CompatLevel = "preferred" | "allowed" | "blocked";
export type Status = "active" | "draft" | "retired";

// ── Template library (in-repo seed) ────────────────────────────────────────
export interface HookTemplate {
  id: string; // HK-PRC-01
  family: HookFamily;
  text: string; // text_template with {{slot}} tokens
  onscreen: string; // overlay (P7: bắt buộc)
  visual: string; // visual_directive (P7: bắt buộc)
  duration: [number, number]; // [min, max] giây
  words: [number, number];
  requiresSlots: string[];
  optionalSlots?: string[];
  promiseTags: PromiseTag[]; // allowed promise(s) — R1
  toneTags: Tone[];
  platformFit: Platform[];
  risk: RiskLevel;
  weight?: number;
  status?: Status;
}

export interface NodeTemplate {
  id: string; // BD-01, CTA-04, BP-C1...
  type: Exclude<NodeType, "HOOK">;
  text: string;
  onscreen?: string;
  visual: string;
  duration: [number, number];
  words?: [number, number];
  requiresSlots?: string[];
  optionalSlots?: string[];
  deliversTag?: PromiseTag; // PAYOFF only — must match hook promise (R1)
  funnel?: string; // CTA only
  toneTags?: Tone[]; // empty/undefined ⇒ tone-neutral (fits any agent)
  platformFit?: Platform[];
  weight?: number;
  status?: Status;
}

// One position in a recipe's node chain (HOOK excluded — selected separately).
export interface ChainSlot {
  type: Exclude<NodeType, "HOOK">;
  deliversTag?: PromiseTag; // for PAYOFF positions
  priority?: number; // lower = dropped first under budget pressure (R2)
}

export interface Recipe {
  id: string; // CT-02
  nameVi: string;
  pillar: string;
  preferredHooks: HookFamily[];
  allowedHooks: HookFamily[];
  payoffTags: PromiseTag[]; // valid delivers_tag set (R1)
  chain: Partial<Record<Duration, ChainSlot[]>>; // per duration (15/30/60)
}

// ── Slot registry ───────────────────────────────────────────────────────────
export type SlotGroup = "project" | "market" | "agent" | "audience" | "format";
export type SlotDataType = "text" | "number" | "currency" | "date" | "enum" | "keyword";

export interface SlotDef {
  key: string;
  group: SlotGroup;
  dataType: SlotDataType;
  sourcePath?: string; // e.g. "project.priceMin" | "branding.displayName"
  formatter?: string; // key into FORMATTERS
  computed?: string; // doc-only note for computed slots
  fallbackText?: string; // R8 step 3
  requiresSource?: boolean; // market group ⇒ must resolve {{nguon}} (R5)
}

// ── Compatibility matrix ─────────────────────────────────────────────────────
export type CompatMatrix = Record<HookFamily, Partial<Record<string, CompatLevel>>>;

// ── Assembly I/O ─────────────────────────────────────────────────────────────
export interface AssembleInput {
  projectId: string;
  agentId: string; // = userId
  platform: Platform;
  durationS: Duration;
  contentType?: string; // recipe id; else picked by pillar rotation
  pillar?: string;
  seoKeyword?: string;
  attempt?: number; // regenerate ⇒ attempt+1
}

export interface SlotMap {
  values: Record<string, string>; // rendered (formatted) string values
  missing: string[]; // required slots that could not resolve
  meta: Record<string, { source?: string; validUntil?: string }>;
}

// A selected template normalized across hooks/nodes, before slot substitution.
export interface PickedNode {
  id: string;
  type: NodeType;
  family?: HookFamily;
  text: string;
  onscreen: string;
  visual: string;
  duration: [number, number];
}

// Same shape after slot substitution (text/onscreen/visual rendered).
export type RenderedNode = PickedNode;

export interface ScriptLine {
  start: number; // cumulative seconds
  end: number;
  visual: string;
  speech: string;
  overlay: string;
}

export interface LintHit {
  rule: string; // e.g. "R10:financial_promise"
  match: string; // offending text
  where: string; // node id
  message: string;
}

export interface ScriptResult {
  status: "OK" | "BLOCKED" | "MISSING_SLOTS";
  script?: ScriptLine[];
  caption?: { text: string; hashtags: string[] };
  checklist?: string[];
  missingSlots?: string[];
  lint?: { hardBlocks: LintHit[]; warnings: LintHit[] };
  // Self-contained copy-paste prompt (angle + verified data + arc) for an
  // external generative AI. Built server-side; no AI call here.
  aiPrompt?: string;
  // Coherence of the chosen nodes against the chosen angle (R: đồng nhất).
  cohesion?: { score: number; offTopic: string[]; angleId?: string; suggestedAngleId?: string };
  // A/B: a second eligible hook for the same script (P5).
  altHook?: { id: string; family?: HookFamily; text: string; onscreen: string; visual: string };
  meta?: {
    seed: string;
    recipeId: string;
    hookId: string;
    nodeIds: string[];
    slotSnapshot: Record<string, string>;
    platform: Platform;
    durationS: Duration;
    scriptId?: string; // set after persistence
  };
}

// Per-agent template usage history for the anti-repetition rule (R4).
export interface RotationEntry {
  templateId: string;
  lastUsedAt: string; // ISO
  useCount: number;
}
