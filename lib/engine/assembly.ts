import type { BlockTone, ContentBlock, Fact } from "@/types/domain";
import { blockUsable } from "./compliance";
import { substitute, type VarContext } from "./variables";
import { pickIndex } from "./variants";

export interface NodeWithBlocks {
  id: string;
  label: string;
  category: string;
  facts: Fact[];
  blocks: ContentBlock[];
}

export interface AssembleInput {
  structure: string[]; // slot roles from the chosen template
  nodes: NodeWithBlocks[]; // selected nodes (order matters)
  ctaBlocks: ContentBlock[]; // global CTA pool
  ctx: VarContext;
  seed: string;
}

export interface AssembleResult {
  caption: string;
  usedBlockIds: string[];
  missingVars: string[];
}

// Pick a usable block of `role` for `node`, variant chosen by seed. `exclude`
// keeps a block from appearing twice in one caption (e.g. two body slots
// landing on the same node would otherwise pick the identical block — a
// verbatim duplicated paragraph). All candidates excluded → null (skip slot).
function pickBlock(
  blocks: ContentBlock[],
  facts: Fact[],
  role: string,
  seed: string,
  exclude?: ReadonlySet<string>,
): ContentBlock | null {
  const usable = blocks.filter(
    (b) =>
      b.role === role &&
      b.isEnabled &&
      !exclude?.has(b.id) &&
      blockUsable(
        { role: b.role, tone: b.tone, minConfidence: b.minConfidence, factKeys: b.factKeys },
        facts,
      ).usable,
  );
  if (usable.length === 0) return null;
  return usable[pickIndex(seed, usable.length)];
}

// Deterministically assemble a caption from selected nodes + their blocks.
export function assembleCaption(input: AssembleInput): AssembleResult {
  const { structure, nodes, ctaBlocks, ctx, seed } = input;
  const pieces: string[] = [];
  const usedBlockIds: string[] = [];
  const missing = new Set<string>();
  let bodyCursor = 0;

  const proofNode = [...nodes].sort((a, b) => b.facts.length - a.facts.length)[0];
  const used = new Set<string>();

  for (const role of structure) {
    let block: ContentBlock | null = null;
    let facts: Fact[] = [];

    if (role === "cta") {
      const usable = ctaBlocks.filter((b) => b.isEnabled && !used.has(b.id));
      block = usable.length ? usable[pickIndex(`${seed}:cta`, usable.length)] : null;
    } else if (role === "hook") {
      const n = nodes[0];
      if (n) { block = pickBlock(n.blocks, n.facts, "hook", `${seed}:hook:${n.id}`, used); facts = n.facts; }
    } else if (role === "proof") {
      if (proofNode) {
        block = pickBlock(proofNode.blocks, proofNode.facts, "proof", `${seed}:proof:${proofNode.id}`, used);
        facts = proofNode.facts;
      }
    } else {
      // body: cycle through nodes; seed includes the slot occurrence so two
      // body slots on the same node diverge instead of duplicating.
      const n = nodes[bodyCursor % nodes.length];
      const occurrence = bodyCursor;
      bodyCursor++;
      if (n) { block = pickBlock(n.blocks, n.facts, "body", `${seed}:body:${occurrence}:${n.id}`, used); facts = n.facts; }
    }

    if (!block) continue;
    const sub = substitute(block.text, ctx);
    if (sub.missing.length) {
      for (const m of sub.missing) missing.add(m);
      continue; // skip a block we can't fully fill (missing required var)
    }
    pieces.push(sub.text);
    usedBlockIds.push(block.id);
    used.add(block.id);
  }

  return { caption: pieces.join("\n\n").trim(), usedBlockIds, missingVars: [...missing] };
}

// ── Editable composition ─────────────────────────────────────────────────────
// Same slot logic as assembleCaption, but instead of picking one block per slot
// it returns ALL usable+substituted options so the UI can let the agent cycle
// variants per slot. `selectedIndex` is the deterministic default (seed-chosen).
export interface EditableOption {
  blockId: string;
  text: string; // already variable-substituted
  tone: BlockTone;
}
export interface EditableSlot {
  key: string; // stable unique id for the slot occurrence
  role: string;
  nodeLabel: string | null; // source node (null for the global CTA pool)
  options: EditableOption[];
  selectedIndex: number;
}

export function buildEditableCaption(input: AssembleInput): { slots: EditableSlot[] } {
  const { structure, nodes, ctaBlocks, ctx, seed } = input;
  const slots: EditableSlot[] = [];
  let bodyCursor = 0;
  const proofNode = [...nodes].sort((a, b) => b.facts.length - a.facts.length)[0];

  structure.forEach((role, idx) => {
    let pool: ContentBlock[] = [];
    let facts: Fact[] = [];
    let nodeLabel: string | null = null;

    if (role === "cta") {
      pool = ctaBlocks;
    } else if (role === "hook") {
      const n = nodes[0];
      if (n) { pool = n.blocks; facts = n.facts; nodeLabel = n.label; }
    } else if (role === "proof") {
      if (proofNode) { pool = proofNode.blocks; facts = proofNode.facts; nodeLabel = proofNode.label; }
    } else {
      const n = nodes[bodyCursor % nodes.length];
      bodyCursor++;
      if (n) { pool = n.blocks; facts = n.facts; nodeLabel = n.label; }
    }

    const options = usableOptions(pool, facts, role, ctx);
    if (options.length === 0) return;

    const slotSeed = `${seed}:${role}:${idx}:${nodeLabel ?? "cta"}`;
    slots.push({
      key: `${role}-${idx}`,
      role,
      nodeLabel,
      options,
      selectedIndex: pickIndex(slotSeed, options.length),
    });
  });

  return { slots };
}

// Compliance-filter + variable-substitute a pool of blocks for one role.
function usableOptions(
  pool: ContentBlock[], facts: Fact[], role: string, ctx: VarContext,
): EditableOption[] {
  const out: EditableOption[] = [];
  for (const b of pool) {
    if (!b.isEnabled) continue;
    if (role !== "cta") {
      if (b.role !== role) continue;
      const c = blockUsable(
        { role: b.role, tone: b.tone, minConfidence: b.minConfidence, factKeys: b.factKeys },
        facts,
      );
      if (!c.usable) continue;
    }
    const sub = substitute(b.text, ctx);
    if (sub.missing.length) continue; // can't fully fill → not offered
    out.push({ blockId: b.id, text: sub.text, tone: b.tone });
  }
  return out;
}

// Every usable (node × role) option group + the CTA pool — the menu of
// paragraphs an agent can ADD to a caption beyond the template structure.
export function buildAddableGroups(
  input: Omit<AssembleInput, "structure" | "seed">,
): EditableSlot[] {
  const { nodes, ctaBlocks, ctx } = input;
  const groups: EditableSlot[] = [];
  const roles = ["hook", "body", "proof"] as const;
  for (const n of nodes) {
    for (const role of roles) {
      const options = usableOptions(n.blocks, n.facts, role, ctx);
      if (options.length) {
        groups.push({ key: `${n.id}:${role}`, role, nodeLabel: n.label, options, selectedIndex: 0 });
      }
    }
  }
  const ctaOptions = usableOptions(ctaBlocks, [], "cta", ctx);
  if (ctaOptions.length) {
    groups.push({ key: "cta:pool", role: "cta", nodeLabel: null, options: ctaOptions, selectedIndex: 0 });
  }
  return groups;
}
