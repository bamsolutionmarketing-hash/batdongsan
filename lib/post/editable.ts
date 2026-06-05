import { nodesByIds } from "@/lib/repo/nodes";
import { blocksByNode } from "@/lib/repo/blocks";
import { listTemplates } from "@/lib/repo/templates";
import { getBranding } from "@/lib/repo/branding";
import { getProjectById } from "@/lib/repo/projects";
import { pickTemplate } from "@/lib/engine/templates";
import { buildEditableCaption, type NodeWithBlocks, type EditableSlot } from "@/lib/engine/assembly";
import type { GeneratedPost } from "@/lib/repo/posts";

const DEFAULT_STRUCTURE = ["hook", "body", "proof", "cta"];

// Resolve a post into its editable slot composition (per-slot variant options).
// Mirrors createPost's assembly gathering but keeps every usable option so the
// agent can swap variants in the UI. Seeded by the post's variant_seed.
export async function getEditableComposition(
  post: GeneratedPost,
  userId: string,
): Promise<{ slots: EditableSlot[] }> {
  const [nodesRes, brandingRes, projectRes, templatesRes] = await Promise.all([
    nodesByIds(post.nodeIds),
    getBranding(userId),
    getProjectById(post.projectId),
    listTemplates(),
  ]);
  const nodes = nodesRes.ok ? nodesRes.data : [];
  if (nodes.length === 0) return { slots: [] };
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

  const template = pickTemplate(templates, nodes.map((n) => n.category), post.variantSeed);
  return buildEditableCaption({
    structure: template?.structure ?? DEFAULT_STRUCTURE,
    nodes: nodesWithBlocks,
    ctaBlocks,
    ctx: {
      branding: branding
        ? { displayName: branding.displayName, phone: branding.phone, zalo: branding.zalo }
        : undefined,
      project: project ? { name: project.name, view360Url: project.view360Url } : undefined,
    },
    seed: post.variantSeed,
  });
}
