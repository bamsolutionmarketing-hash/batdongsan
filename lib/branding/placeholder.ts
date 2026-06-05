import "server-only";
import sharp from "sharp";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Per-category theme: a base hue + a Vietnamese chip label. Gives images a
// coherent colour language (roads blue, finance green, events rose…).
const THEME: Record<string, { hue: number; vi: string }> = {
  project: { hue: 205, vi: "Dự án" },
  infra: { hue: 212, vi: "Hạ tầng" },
  road: { hue: 212, vi: "Giao thông" },
  metro: { hue: 222, vi: "Metro" },
  finance: { hue: 150, vi: "Thị trường" },
  policy: { hue: 158, vi: "Quy hoạch" },
  masterplan: { hue: 36, vi: "Khu đô thị" },
  location: { hue: 32, vi: "Vị trí" },
  cluster: { hue: 28, vi: "Phân khu" },
  amenity: { hue: 190, vi: "Tiện ích" },
  cert: { hue: 174, vi: "Chứng nhận" },
  developer: { hue: 255, vi: "Chủ đầu tư" },
  group: { hue: 258, vi: "Tập đoàn" },
  brand: { hue: 268, vi: "Thương hiệu" },
  partner: { hue: 248, vi: "Đối tác" },
  comparable: { hue: 285, vi: "So sánh" },
  event: { hue: 330, vi: "Sự kiện" },
};
const themeFor = (cat?: string | null) => (cat && THEME[cat]) || { hue: 215, vi: cat ?? "Điểm nổi bật" };

// Greedy word-wrap to ~max chars/line, capped at maxLines.
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

// Generate a tasteful placeholder "master" (themed gradient + project tag +
// category chip + node label + accent + soft geometry) for nodes that don't
// have an uploaded photo yet. JPEG buffer.
export async function placeholderMaster(
  opts: { label: string; project?: string | null; category?: string | null; story?: boolean },
): Promise<Buffer> {
  const W = opts.story ? 1080 : 1600;
  const H = opts.story ? 1920 : 1200;
  const { hue, vi } = themeFor(opts.category);
  const accent = `hsl(${hue},78%,62%)`;

  const titleSize = Math.round(W * (opts.story ? 0.072 : 0.066));
  const lines = wrap(opts.label, opts.story ? 16 : 22);
  const cx = W / 2;
  const blockH = lines.length * titleSize * 1.16;
  const titleTop = H / 2 - blockH / 2 + titleSize * 0.5;

  const titleSvg = lines
    .map((ln, i) => `<text x="${cx}" y="${titleTop + i * titleSize * 1.16}" font-family="sans-serif" font-size="${titleSize}" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${esc(ln)}</text>`)
    .join("");

  const projSize = Math.round(W * 0.026);
  const projSvg = opts.project
    ? `<text x="${cx}" y="${titleTop - blockH / 2 - titleSize * 0.62}" font-family="sans-serif" font-size="${projSize}" fill="rgba(255,255,255,0.7)" letter-spacing="5" text-anchor="middle">${esc(opts.project.toUpperCase())}</text>`
    : "";

  // Category chip (top-left).
  const chipFont = Math.round(W * 0.022);
  const chipW = Math.round(esc(vi).length * chipFont * 0.62) + 40;
  const chipH = chipFont + 22;
  const chipX = Math.round(W * (opts.story ? 0.06 : 0.04));
  const chipY = chipX;
  const chip =
    `<rect x="${chipX}" y="${chipY}" width="${chipW}" height="${chipH}" rx="${chipH / 2}" fill="hsl(${hue},60%,50%,0.18)" stroke="${accent}" stroke-opacity="0.55"/>` +
    `<text x="${chipX + chipW / 2}" y="${chipY + chipH / 2 + 1}" font-family="sans-serif" font-size="${chipFont}" font-weight="600" fill="${accent}" text-anchor="middle" dominant-baseline="central">${esc(vi)}</text>`;

  // Accent underline beneath the title.
  const ruleY = titleTop + blockH - titleSize * 0.3 + 18;
  const ruleW = Math.round(W * 0.07);
  const rule = `<rect x="${cx - ruleW / 2}" y="${ruleY}" width="${ruleW}" height="6" rx="3" fill="${accent}"/>`;

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${hue},40%,16%)"/>
        <stop offset="1" stop-color="hsl(${(hue + 34) % 360},58%,7%)"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.28" cy="0.22" r="0.8">
        <stop offset="0" stop-color="hsl(${hue},80%,55%)" stop-opacity="0.28"/>
        <stop offset="1" stop-color="hsl(${hue},80%,55%)" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stop-color="#000000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.45"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <g stroke="${accent}" stroke-opacity="0.12" fill="none" stroke-width="2">
      <circle cx="${W - W * 0.04}" cy="${H - H * 0.05}" r="${W * 0.18}"/>
      <circle cx="${W - W * 0.04}" cy="${H - H * 0.05}" r="${W * 0.28}"/>
      <circle cx="${W - W * 0.04}" cy="${H - H * 0.05}" r="${W * 0.38}"/>
    </g>
    <rect width="${W}" height="${H}" fill="url(#vig)"/>
    ${chip}${projSvg}${titleSvg}${rule}
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 86 }).toBuffer();
}
