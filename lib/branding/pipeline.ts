import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBranding } from "@/lib/repo/branding";
import { compositeImage } from "./composite";

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
  const hash = brandingHash([
    branding.logoPath, branding.displayName, branding.phone, branding.position,
    opts.story ? "story" : "feed", opts.watermark,
  ]);

  const out: BrandedImage[] = [];
  for (const nodeId of nodeIds.slice(0, 4)) {
    const asset = await masterFor(admin, nodeId);
    if (!asset) continue;
    const outPath = `${userId}/${asset.id}${opts.story ? "-s" : ""}.jpg`;

    // Cache check (feed only — story regenerates).
    if (!opts.story) {
      const { data: cached } = await admin
        .from("branded_assets")
        .select("storage_path, branding_hash")
        .eq("asset_id", asset.id)
        .eq("user_id", userId)
        .maybeSingle();
      if (cached && (cached as any).branding_hash === hash) {
        const s = await admin.storage.from("branded").createSignedUrl((cached as any).storage_path, 3600);
        if (s.data) { out.push({ url: s.data.signedUrl, nodeId }); continue; }
      }
    }

    const master = await admin.storage.from("assets").download(asset.storage_path);
    if (!master.data) continue;
    const composed = await compositeImage({
      master: Buffer.from(await master.data.arrayBuffer()),
      logo: logoBuf,
      name: branding.displayName,
      phone: branding.phone,
      safeZone: branding.position,
      story: opts.story,
      watermark: opts.watermark,
    });
    await admin.storage.from("branded").upload(outPath, composed, { contentType: "image/jpeg", upsert: true });
    if (!opts.story) {
      await admin.from("branded_assets").upsert({
        asset_id: asset.id, user_id: userId, storage_path: outPath, branding_hash: hash,
      });
    }
    const s = await admin.storage.from("branded").createSignedUrl(outPath, 3600);
    if (s.data) out.push({ url: s.data.signedUrl, nodeId });
  }
  return out;
}
