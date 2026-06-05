import "server-only";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBranding } from "@/lib/repo/branding";
import { compositeImage } from "./composite";
import { placeholderMaster, themeFor } from "./placeholder";
import { buildCarousel, buildCollage, type Slide, type SetBrand } from "./assemble";

const cleanHook = (s: string) => s.trim().replace(/^["“”']+|["“”']+$/g, "").trim();

// Node label + talkpoint + project name, for placeholder masters & story hooks.
async function nodeMeta(admin: ReturnType<typeof createAdminClient>, nodeIds: string[]) {
  const { data: nodes } = await admin
    .from("knowledge_nodes")
    .select("id, label, talkpoint, category, project_id")
    .in("id", nodeIds);
  const rows = (nodes ?? []) as { id: string; label: string; talkpoint: string | null; category: string; project_id: string }[];
  const projectIds = [...new Set(rows.map((r) => r.project_id))];
  const { data: projs } = await admin.from("projects").select("id, name").in("id", projectIds);
  const projName = new Map((projs ?? []).map((p: { id: string; name: string }) => [p.id, p.name]));
  return new Map(rows.map((r) => [r.id, { label: r.label, talkpoint: r.talkpoint, category: r.category, project: projName.get(r.project_id) ?? null }]));
}

export interface BrandedImage {
  url: string;
  nodeId: string;
  placeholder: boolean; // true when the master is a generated placeholder (no uploaded photo)
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
        if (s.data) { out.push({ url: s.data.signedUrl, nodeId, placeholder: false }); continue; }
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
        label: info?.label ?? "Dự án", project: info?.project, category: info?.category,
        story: opts.story, logo: logoBuf,
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
    if (s.data) out.push({ url: s.data.signedUrl, nodeId, placeholder: !asset });
  }
  return out;
}

// ── Multi-image assembly (Track A): carousel + collage ──────────────────────

type Admin = ReturnType<typeof createAdminClient>;
type NodeInfo = { label: string; talkpoint: string | null; category: string; project: string | null };

// Branding row + downloaded logo (shared by carousel/collage). null → no brand.
async function brandAndLogo(admin: Admin, userId: string) {
  const brandingRes = await getBranding(userId);
  const branding = brandingRes.ok ? brandingRes.data : null;
  if (!branding) return null;
  let logoBuf: Buffer | null = null;
  if (branding.logoPath) {
    const dl = await admin.storage.from("logos").download(branding.logoPath);
    if (dl.data) logoBuf = Buffer.from(await dl.data.arrayBuffer());
  }
  return { branding, logoBuf };
}

// Master buffer for a node: uploaded photo if present, else a placeholder.
async function nodeMasterBuf(admin: Admin, nodeId: string, info: NodeInfo | undefined, logoBuf: Buffer | null) {
  const asset = await masterFor(admin, nodeId);
  if (asset) {
    const dl = await admin.storage.from("assets").download(asset.storage_path);
    if (dl.data) return { buf: Buffer.from(await dl.data.arrayBuffer()), placeholder: false };
  }
  const buf = await placeholderMaster({ label: info?.label ?? "Dự án", project: info?.project, category: info?.category, logo: logoBuf });
  return { buf, placeholder: true };
}

async function signed(admin: Admin, path: string): Promise<string | null> {
  const s = await admin.storage.from("branded").createSignedUrl(path, 3600);
  return s.data?.signedUrl ?? null;
}

export interface AssembledSet {
  urls: string[];
  placeholder: boolean; // any slide fell back to a generated placeholder master
}

// Carousel: cover → one slide per node (auto-numbered) → CTA. Cached per
// (post, branding, node order) in the branded bucket; signed URLs (TTL 1h).
export async function getCarousel(
  userId: string, postId: string, nodeIds: string[], opts: { watermark?: string | null } = {},
): Promise<AssembledSet> {
  let admin: Admin;
  try { admin = createAdminClient(); } catch { return { urls: [], placeholder: false }; }
  const bl = await brandAndLogo(admin, userId);
  if (!bl) return { urls: [], placeholder: false };
  const { branding, logoBuf } = bl;
  const ids = nodeIds.slice(0, 4);
  if (!ids.length) return { urls: [], placeholder: false };

  const hash = brandingHash([branding.logoPath, branding.displayName, branding.phone, branding.zalo, "carousel", ids.join(","), opts.watermark]);
  const total = ids.length + 2;
  const paths = Array.from({ length: total }, (_, i) => `${userId}/sets/${postId}-${hash}-c${i}.jpg`);

  // Fast path: every slide already rendered for this exact branding/order.
  const pre = await Promise.all(paths.map((p) => signed(admin, p)));
  if (pre.every((u): u is string => !!u)) return { urls: pre, placeholder: false };

  const meta = await nodeMeta(admin, ids) as Map<string, NodeInfo>;
  const masters = await Promise.all(ids.map((id) => nodeMasterBuf(admin, id, meta.get(id), logoBuf)));
  const anyPlaceholder = masters.some((m) => m.placeholder);
  const coverHue = themeFor(meta.get(ids[0])?.category).hue;
  const projectName = meta.get(ids[0])?.project ?? "Dự án";
  const setBrand: SetBrand = { name: branding.displayName, phone: branding.phone, zalo: branding.zalo, logo: logoBuf, watermark: opts.watermark };

  const slides: Slide[] = [];
  let idx = 1;
  slides.push({ kind: "cover", hue: coverHue, kicker: "Điểm nhấn dự án", title: projectName, caption: `${ids.length} điểm nổi bật`, index: idx++, total });
  ids.forEach((id, i) => {
    const info = meta.get(id);
    slides.push({
      kind: "node", master: masters[i].buf, hue: themeFor(info?.category).hue,
      kicker: `Điểm ${i + 1}`, title: info?.label ?? "Điểm nổi bật", caption: info?.talkpoint ?? null,
      index: idx++, total,
    });
  });
  slides.push({ kind: "cta", hue: coverHue, title: "Liên hệ tư vấn", index: idx++, total });

  const bufs = await buildCarousel(slides, setBrand);
  await Promise.all(bufs.map((b, i) => admin.storage.from("branded").upload(paths[i], b, { contentType: "image/jpeg", upsert: true })));
  const urls = (await Promise.all(paths.map((p) => signed(admin, p)))).filter((u): u is string => !!u);
  return { urls, placeholder: anyPlaceholder };
}

// Collage: 2–4 node photos in one 1080×1080 image with title band + branding.
export async function getCollage(
  userId: string, postId: string, nodeIds: string[], opts: { watermark?: string | null } = {},
): Promise<AssembledSet> {
  let admin: Admin;
  try { admin = createAdminClient(); } catch { return { urls: [], placeholder: false }; }
  const bl = await brandAndLogo(admin, userId);
  if (!bl) return { urls: [], placeholder: false };
  const { branding, logoBuf } = bl;
  const ids = nodeIds.slice(0, 4);
  if (ids.length < 2) return { urls: [], placeholder: false }; // collage needs ≥2 photos

  const hash = brandingHash([branding.logoPath, branding.displayName, branding.phone, "collage", ids.join(","), opts.watermark]);
  const path = `${userId}/sets/${postId}-${hash}-collage.jpg`;
  const pre = await signed(admin, path);
  if (pre) return { urls: [pre], placeholder: false };

  const meta = await nodeMeta(admin, ids) as Map<string, NodeInfo>;
  const masters = await Promise.all(ids.map((id) => nodeMasterBuf(admin, id, meta.get(id), logoBuf)));
  const items = ids.map((id, i) => ({ master: masters[i].buf, label: meta.get(id)?.label ?? "Điểm nổi bật" }));
  const setBrand: SetBrand = { name: branding.displayName, phone: branding.phone, zalo: branding.zalo, logo: logoBuf, watermark: opts.watermark };
  const buf = await buildCollage(items, setBrand, { title: meta.get(ids[0])?.project ?? "Dự án", hue: themeFor(meta.get(ids[0])?.category).hue });
  await admin.storage.from("branded").upload(path, buf, { contentType: "image/jpeg", upsert: true });
  const url = await signed(admin, path);
  return { urls: url ? [url] : [], placeholder: masters.some((m) => m.placeholder) };
}
