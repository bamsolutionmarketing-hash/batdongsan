import "server-only";
import sharp from "sharp";
import "./fonts";

export interface CompositeOpts {
  master: Buffer;
  logo?: Buffer | null;
  name: string;
  phone: string;
  safeZone: string; // bottom_right | bottom_left | top_right | top_left
  story?: boolean; // 9:16 crop for stories
  hook?: string | null; // story headline overlay (1-line hook)
  watermark?: string | null; // free-tier mark → big, centred, 33% opacity
}

const PAD = 28;
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Greedy word-wrap to ~max chars/line, capped at maxLines (last line
// ellipsised when truncated — a hook cut mid-phrase reads as broken copy).
function wrap(s: string, max: number, maxLines: number): string[] {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[.,;:]?$/, "") + "…";
    return kept;
  }
  return lines;
}

// Composite agent branding (logo + "Name — Phone") onto a master image.
// Story mode adds a hook headline overlay; free tier adds a centred watermark.
// Returns a JPEG buffer. Pure-ish (no IO beyond Sharp).
export async function compositeImage(opts: CompositeOpts): Promise<Buffer> {
  let base = sharp(opts.master).rotate();
  base = opts.story
    ? base.resize(1080, 1920, { fit: "cover" })
    : base.resize({ width: 1600, withoutEnlargement: true });

  const buf = await base.jpeg({ quality: 82 }).toBuffer();
  const meta = await sharp(buf).metadata();
  const W = meta.width ?? (opts.story ? 1080 : 1600);
  const H = meta.height ?? (opts.story ? 1920 : 1200);

  const bottom = opts.safeZone.startsWith("bottom");
  const right = opts.safeZone.endsWith("right");
  const fontSize = Math.round(W * 0.028);
  const text = esc([opts.name, opts.phone].filter(Boolean).join("  —  "));
  const boxH = fontSize + 22;
  const boxW = Math.min(W - PAD * 2, Math.round(text.length * fontSize * 0.6) + 40);
  const x = right ? W - PAD - boxW : PAD;
  const y = bottom ? H - PAD - boxH : PAD;
  const anchorX = right ? x + boxW - 20 : x + 20;

  // Story hook overlay (top band, large, up to 3 lines) for readability.
  let hookSvg = "";
  if (opts.story && opts.hook) {
    const hs = Math.round(W * 0.058);
    const lines = wrap(opts.hook, 18, 3);
    const top = Math.round(H * 0.08);
    const bandH = lines.length * hs * 1.2 + 40;
    hookSvg =
      `<rect x="0" y="${top - 24}" width="${W}" height="${bandH}" fill="rgba(8,12,20,0.42)"/>` +
      lines.map((ln, i) =>
        `<text x="${PAD}" y="${top + i * hs * 1.2 + hs * 0.5}" font-family="sans-serif" font-size="${hs}" font-weight="800" fill="#ffffff" dominant-baseline="central">${esc(ln)}</text>`,
      ).join("");
  }

  // Free-tier watermark: big, centred, rotated, ~33% opacity.
  const wm = opts.watermark
    ? `<text x="${W / 2}" y="${H / 2}" font-family="sans-serif" font-size="${Math.round(W * 0.085)}" font-weight="700" fill="rgba(255,255,255,0.33)" text-anchor="middle" dominant-baseline="central" transform="rotate(-30 ${W / 2} ${H / 2})">${esc(opts.watermark)}</text>`
    : "";

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    ${hookSvg}
    ${wm}
    <rect x="${x}" y="${y}" width="${boxW}" height="${boxH}" rx="10" fill="rgba(8,12,20,0.62)"/>
    <text x="${anchorX}" y="${y + boxH / 2}" font-family="sans-serif" font-size="${fontSize}"
      font-weight="600" fill="#ffffff" text-anchor="${right ? "end" : "start"}"
      dominant-baseline="central">${text}</text>
  </svg>`;

  const layers: sharp.OverlayOptions[] = [{ input: Buffer.from(svg), top: 0, left: 0 }];

  if (opts.logo) {
    const logoW = Math.round(W * 0.12);
    const logo = await sharp(opts.logo).resize({ width: logoW }).png().toBuffer();
    const lm = await sharp(logo).metadata();
    const logoH = lm.height ?? logoW;
    layers.push({
      input: logo,
      top: bottom ? y - logoH - 10 : y + boxH + 10,
      left: right ? W - PAD - logoW : PAD,
    });
  }

  return sharp(buf).composite(layers).jpeg({ quality: 82 }).toBuffer();
}
