// Domain types + the unified Result envelope. Hand-written for now; once 0004 is
// applied we also generate types/db.ts via `supabase gen types`.

// ── Result envelope (every repo/action returns this) ──────────────────────
export type ErrorCode = "GATE" | "VALIDATION" | "NOT_FOUND" | "INTERNAL";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ErrorCode };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = (code: ErrorCode, error: string): Result<never> => ({
  ok: false,
  code,
  error,
});

// ── Enums (mirror migration 0004) ─────────────────────────────────────────
export type Tier = "free" | "pro" | "team";
export type SubStatus = "active" | "past_due" | "canceled";
export type UserRole = "agent" | "admin";
export type BlockRole = "hook" | "body" | "proof" | "cta";
export type BlockTone = "neutral" | "fomo" | "story";
export type Confidence = "verified" | "sales_claim" | "unverified";

// ── Core rows ─────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  developerId: string | null;
  name: string;
  slug: string;
  phase: string | null;
  locationText: string | null;
  status: string | null;
  priceMin: number | null;
  priceMax: number | null;
  view360Url: string | null;
  thumbnailUrl: string | null;
  isDemo: boolean;
  isPublished: boolean;
}

export interface Fact {
  key: string;
  value: string;
  confidence?: Confidence;
  source?: string;
}

export interface KnowledgeNode {
  id: string;
  projectId: string;
  nodeKey: string;
  label: string;
  category: string;
  subLabel: string | null;
  facts: Fact[];
  talkpoint: string | null;
  description: string | null;
  sortOrder: number;
}

export interface KnowledgeLink {
  id: string;
  projectId: string;
  sourceNode: string;
  targetNode: string;
  label: string | null;
}

export interface ContentBlock {
  id: string;
  nodeId: string;
  role: BlockRole;
  variantNo: number;
  text: string;
  tone: BlockTone;
  minConfidence: Confidence;
  factKeys: string[];
  isEnabled: boolean;
}

export interface AgentBranding {
  userId: string;
  displayName: string;
  phone: string;
  zalo: string | null;
  logoPath: string | null;
  position: string;
}

// ── Engine I/O ────────────────────────────────────────────────────────────
export type ComposeMode = "fb_post" | "fb_analysis" | "short_caption" | "zalo_message";
export type ComposeTone = "chuyen_gia" | "than_thien" | "ke_chuyen";

export interface PostDraft {
  caption: string;
  templateId: string | null;
  variantSeed: string;
  nodeOrder: string[];
}

export interface QuotaCheck {
  allowed: boolean;
  used: number;
  limit: number | null; // null = unlimited
}
