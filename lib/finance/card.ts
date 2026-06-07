import "server-only";
import sharp from "sharp";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBranding } from "@/lib/repo/branding";
import { DISCLAIMER_SHORT } from "./disclaimer";

// Branded, shareable finance card (PNG). Self-contained SVG → raster, with the
// agent's name/phone (+ logo if uploaded) and the compliance footer. Ephemeral:
// returned as bytes, not stored. 1080×1350 (4:5, fits Zalo/Facebook nicely).

const W = 1080;
const H = 1350;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Greedy wrap to ~max chars over up to maxLines lines.
function wrap(s: string, max: number, maxLines: number): string[] {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

export interface CardRow {
  label: string;
  value: string;
}

export interface FinanceCard {
  title: string;
  subtitle?: string | null;
  rows: CardRow[];
}

// Render the SVG/PNG for the given content + brand. Pure (no IO).
async function rasterize(card: FinanceCard, brand: { name: string; phone: string }): Promise<Buffer> {
  const rowsSvg = card.rows
    .slice(0, 6)
    .map((r, idx) => {
      const y = 430 + idx * 116;
      return `
        <text x="72" y="${y}" font-size="34" fill="#94a3b8" font-family="sans-serif">${esc(r.label)}</text>
        <text x="${W - 72}" y="${y + 44}" font-size="52" font-weight="700" fill="#f1f5f9" text-anchor="end" font-family="sans-serif">${esc(r.value)}</text>
        <line x1="72" y1="${y + 70}" x2="${W - 72}" y2="${y + 70}" stroke="#1e293b" stroke-width="2"/>`;
    })
    .join("");

  const discLines = wrap(DISCLAIMER_SHORT, 64, 2)
    .map((l, i) => `<text x="72" y="${H - 96 + i * 30}" font-size="22" fill="#64748b" font-family="sans-serif">${esc(l)}</text>`)
    .join("");

  const subtitle = card.subtitle
    ? `<text x="72" y="240" font-size="34" fill="#7dd3fc" font-family="sans-serif">${esc(card.subtitle)}</text>`
    : "";

  const svg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#0b1220"/>
      <rect x="0" y="0" width="${W}" height="12" fill="#38bdf8"/>
      <text x="72" y="160" font-size="40" fill="#38bdf8" font-family="sans-serif">📊 Dự tính tài chính</text>
      <text x="72" y="${card.subtitle ? 210 : 230}" font-size="${card.subtitle ? 58 : 64}" font-weight="800" fill="#f8fafc" font-family="sans-serif">${esc(card.title)}</text>
      ${subtitle}
      <line x1="72" y1="300" x2="${W - 72}" y2="300" stroke="#1e293b" stroke-width="2"/>
      ${rowsSvg}
      <rect x="0" y="${H - 160}" width="${W}" height="160" fill="#0a0f1a"/>
      <text x="72" y="${H - 200}" font-size="40" font-weight="700" fill="#f1f5f9" font-family="sans-serif">${esc(brand.name)}</text>
      <text x="${W - 72}" y="${H - 200}" font-size="36" fill="#7dd3fc" text-anchor="end" font-family="sans-serif">${esc(brand.phone)}</text>
      ${discLines}
    </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

// Public entry: resolve branding + logo for `userId`, render the card, return a
// PNG buffer (or null when branding isn't set up / admin client unavailable).
export async function renderFinanceCard(userId: string, card: FinanceCard): Promise<Buffer | null> {
  const brandingRes = await getBranding(userId);
  const branding = brandingRes.ok ? brandingRes.data : null;
  if (!branding) return null;

  let png = await rasterize(card, { name: branding.displayName, phone: branding.phone });

  // Composite the logo top-right if the agent uploaded one.
  if (branding.logoPath) {
    try {
      const admin = createAdminClient();
      const dl = await admin.storage.from("logos").download(branding.logoPath);
      if (dl.data) {
        const logo = await sharp(Buffer.from(await dl.data.arrayBuffer()))
          .resize({ width: 150, height: 150, fit: "inside" })
          .png()
          .toBuffer();
        const meta = await sharp(logo).metadata();
        png = await sharp(png)
          .composite([{ input: logo, top: 64, left: W - 72 - (meta.width ?? 150) }])
          .png()
          .toBuffer();
      }
    } catch {
      // logo is best-effort; keep the card without it
    }
  }
  return png;
}
