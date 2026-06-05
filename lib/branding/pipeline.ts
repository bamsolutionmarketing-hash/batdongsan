import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBranding } from "@/lib/repo/branding";
import { compositeImage } from "./composite";
import { placeholderMaster } from "./placeholder";

const cleanHook = (s: string) => s.trim().replace(/^["“”']+|["“”']+$/g, "").trim();

// Node label + talkpoint + project name, for placeholder masters & story hooks.
async function nodeMeta(admin: ReturnType<typeof createAdminClient>, nodeIds: string[]) {
  const { data: nodes } = await admin
    .from("knowledge_nodes")
    .select("id, label, talkpoint, project_id")
    .in("id", nodeIds);
  const rows = (nodes ?? []) as { id: string; label: string; talkpoint: string | null; project_id: string }[];
  const projectIds = [...new Set(rows.map((r) => r.project_id))];
  const { data: projs } = await admin.from("projects").select("id, name").in("id", projectIds);
  const projName = new Map((projs ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));
  return new Map(rows.map((r) => [r.id, { label: r.label, talkpoint: r.talkpoint, project: projName.get(r.project_id) ?? null }]));
}

export interface BrandedImage {
  url: string;
  nodeId: string;
}

function brandingHash(parts: (string | null | undefined)[]): string {
  return createHash("sha1").update(parts.map((p) => p ?? "").join("|")).digest("hex").slice(0, 16);
}

async function masterFor(admin: ReturnType<typeof createAdminClient>, nodeId: string) {
  const { data } = await admin
    .from("node_assets")
    .select("id, storage_path")
    .eq("node_id", nodeId)
    .eq("is_enabled", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data as { id: string; storage_path: string } | null;
}

// Branded image (logo + name/phone) per node — 1 master/node. Feed images are
// cached in branded_assets by (asset,user,hash); story variants regenerate.
// Returns signed URLs (TTL 1h). Up to 4.
export async function getBrandedImages(
  userId: string,
  nodeIds: string[],
  opts: { story?: boolean; watermark?: string | null } = {},
): Promise<BrandedImage[]> {
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return [];
  }
  const brandingRes = await getBranding(userId);
  const branding = brandingRes.ok ? brandingRes.data : null;
  if (!branding) return []; // no branding → nothing to stamp yet

  let logoBuf: Buffer | null = null;
  if (branding.logoPath) {
    const dl = await admin.storage.from("logos").download(branding.logoPath);
    if (dl.data) logoBuf = Buffer.from(await dl.data.arrayBuffer());
  }
  const ids = nodeIds.slice(0, 4);
  const meta = await nodeMeta(admin, ids);
  const hash = brandingHash([
    branding.logoPath, branding.displayName, branding.phone, branding.position,
    opts.story ? "story" : "feed", opts.watermark,
  ]);

  const out: BrandedImage[] = [];
  for (const nodeId of ids) {
    const info = meta.get(nodeId);
    const asset = await masterFor(admin, nodeId);
    // Placeholder masters have no node_asset row, so they can't be cached in
    // branded_assets (FK) — only uploaded masters use the cache.
    const cacheable = !!asset && !opts.story;
    const outPath = `${userId}/${asset ? asset.id : `ph-${nodeId}`}${opts.story ? "-s" : ""}.jpg`;

    if (cacheable) {
      const { data: cached } = await admin
        .from("branded_assets")
        .select("storage_path, branding_hash")
        .eq("asset_id", asset!.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (cached && (cached as any).branding_hash === hash) {
        const s = await admin.storage.from("branded").createSignedUrl((cached as any).storage_path, 3600);
        if (s.data) { out.push({ url: s.data.signedUrl, nodeId }); continue; }
      }
    }

    // Master: uploaded photo if present, else a generated placeholder.
    let masterBuf: Buffer | null = null;
    if (asset) {
      const dl = await admin.storage.from("assets").download(asset.storage_path);
      if (dl.data) masterBuf = Buffer.from(await dl.data.arrayBuffer());
    }
    if (!masterBuf) {
      masterBuf = await placeholderMaster({
        label: info?.label ?? "Dự án", project: info?.project, story: opts.story,
      });
    }

    const hook = opts.story ? cleanHook(info?.talkpoint || info?.label || "") : null;
    const composed = await compositeImage({
      master: masterBuf,
      logo: logoBuf,
      name: branding.displayName,
      phone: branding.phone,
      safeZone: branding.position,
      story: opts.story,
      hook,
      watermark: opts.watermark,
    });
    await admin.storage.from("branded").upload(outPath, composed, { contentType: "image/jpeg", upsert: true });
    if (cacheable) {
      await admin.from("branded_assets").upsert({
        asset_id: asset!.id, user_id: userId, storage_path: outPath, branding_hash: hash,
      });
    }
    const s = await admin.storage.from("branded").createSignedUrl(outPath, 3600);
    if (s.data) out.push({ url: s.data.signedUrl, nodeId });
  }
  return out;
}
