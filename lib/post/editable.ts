import { nodesByIds } from "@/lib/repo/nodes";
import { blocksByNode } from "@/lib/repo/blocks";
import { listTemplates } from "@/lib/repo/templates";
import { getBranding } from "@/lib/repo/branding";
import { getProjectById } from "@/lib/repo/projects";
import { pickTemplate } from "@/lib/engine/templates";
import { buildEditableCaption, buildAddableGroups, type NodeWithBlocks, type EditableSlot } from "@/lib/engine/assembly";
import type { GeneratedPost } from "@/lib/repo/posts";

const DEFAULT_STRUCTURE = ["hook", "body", "proof", "cta"];

// Resolve a post into its editable slot composition (per-slot variant options)
// plus the full menu of addable paragraphs. Mirrors createPost's assembly
// gathering but keeps every usable option so the agent can swap/add variants.
export async function getEditableComposition(
  post: GeneratedPost,
  userId: string,
): Promise<{ slots: EditableSlot[]; addable: EditableSlot[] }> {
  const [nodesRes, brandingRes, projectRes, templatesRes] = await Promise.all([
    nodesByIds(post.nodeIds),
    getBranding(userId),
    getProjectById(post.projectId),
    listTemplates(),
  ]);
  const nodes = nodesRes.ok ? nodesRes.data : [];
  if (nodes.length === 0) return { slots: [], addable: [] };
  const branding = brandingRes.ok ? brandingRes.data : null;
  const project = projectRes.ok ? projectRes.data : null;
  const templates = templatesRes.ok ? templatesRes.data : [];

  const blockResults = await Promise.all(nodes.map((n) => blocksByNode(n.id)));
  const nodesWithBlocks: NodeWithBlocks[] = nodes.map((n, i) => ({
    id: n.id,
    label: n.label,
    category: n.category,
    facts: n.facts,
    blocks: blockResults[i]?.ok ? blockResults[i].data : [],
  }));
  const ctaBlocks = nodesWithBlocks.flatMap((n) => n.blocks.filter((b) => b.role === "cta" && b.isEnabled));
  const ctx = {
    branding: branding
      ? { displayName: branding.displayName, phone: branding.phone, zalo: branding.zalo }
      : undefined,
    project: project ? { name: project.name, view360Url: project.view360Url } : undefined,
  };

  const template = pickTemplate(templates, nodes.map((n) => n.category), post.variantSeed);
  const { slots } = buildEditableCaption({
    structure: template?.structure ?? DEFAULT_STRUCTURE,
    nodes: nodesWithBlocks,
    ctaBlocks,
    ctx,
    seed: post.variantSeed,
  });
  const addable = buildAddableGroups({ nodes: nodesWithBlocks, ctaBlocks, ctx });
  return { slots, addable };
}
