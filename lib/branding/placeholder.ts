import "server-only";
import sharp from "sharp";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Deterministic hue from a label so each node gets a stable colour.
function hue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

// Greedy word-wrap to ~max chars/line, capped at `maxLines`.
function wrap(s: string, max: number, maxLines = 4): string[] {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; }
    else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, maxLines);
}

// Generate a tasteful placeholder "master" (gradient + project + node label)
// for nodes that don't have an uploaded photo yet. JPEG buffer.
export async function placeholderMaster(
  opts: { label: string; project?: string | null; story?: boolean },
): Promise<Buffer> {
  const W = opts.story ? 1080 : 1600;
  const H = opts.story ? 1920 : 1200;
  const hu = hue(opts.label);
  const titleSize = Math.round(W * (opts.story ? 0.072 : 0.066));
  const lines = wrap(opts.label, opts.story ? 16 : 22);
  const blockH = lines.length * titleSize * 1.15;
  const startY = H / 2 - blockH / 2 + titleSize * 0.5;

  const titleSvg = lines
    .map((ln, i) => `<text x="${W / 2}" y="${startY + i * titleSize * 1.15}" font-family="sans-serif" font-size="${titleSize}" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${esc(ln)}</text>`)
    .join("");
  const projSvg = opts.project
    ? `<text x="${W / 2}" y="${startY - blockH / 2 - titleSize * 0.7}" font-family="sans-serif" font-size="${Math.round(W * 0.028)}" fill="rgba(255,255,255,0.72)" letter-spacing="4" text-anchor="middle">${esc(opts.project.toUpperCase())}</text>`
    : "";

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hu},42%,17%)"/>
      <stop offset="1" stop-color="hsl(${(hu + 38) % 360},55%,8%)"/>
    </linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    ${projSvg}${titleSvg}
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 84 }).toBuffer();
}
