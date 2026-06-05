import "server-only";
import sharp from "sharp";

// Multi-image assembly (Track A): turn a post's node images into a swipeable
// carousel (cover → per-point slides → CTA, auto-numbered) or a single collage.
// Pure Sharp compositing — all IO (masters, branding, upload) lives in pipeline.

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Greedy word-wrap to ~max chars/line, capped at maxLines (last line ellipsised).
function wrap(s: string, max: number, maxLines: number): string[] {
  const words = s.split(/\s+/).filter(Boolean);
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

export interface SetBrand {
  name: string;
  phone: string;
  zalo?: string | null;
  logo?: Buffer | null;
  watermark?: string | null; // free-tier upsell mark (subtle, bottom-centre)
}

const CW = 1080, CH = 1350; // 4:5 — the Instagram feed/carousel standard.
const PAD = 64;

// Themed gradient background (cover / CTA / collage canvas), echoing the
// placeholder visual language: diagonal gradient + corner glow + soft arcs.
function gradientSvg(W: number, H: number, hue: number): string {
  const accent = `hsl(${hue},78%,62%)`;
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(${hue},42%,17%)"/>
        <stop offset="1" stop-color="hsl(${(hue + 34) % 360},58%,7%)"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.26" cy="0.2" r="0.85">
        <stop offset="0" stop-color="hsl(${hue},80%,55%)" stop-opacity="0.3"/>
        <stop offset="1" stop-color="hsl(${hue},80%,55%)" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    <g stroke="${accent}" stroke-opacity="0.1" fill="none" stroke-width="2">
      <circle cx="${W - W * 0.05}" cy="${H - H * 0.06}" r="${W * 0.22}"/>
      <circle cx="${W - W * 0.05}" cy="${H - H * 0.06}" r="${W * 0.34}"/>
      <circle cx="${W - W * 0.05}" cy="${H - H * 0.06}" r="${W * 0.46}"/>
    </g>
  </svg>`;
}

// Logo as a small raster overlay, sized to a target width.
async function logoLayer(logo: Buffer, width: number): Promise<{ buf: Buffer; w: number; h: number } | null> {
  try {
    const buf = await sharp(logo).resize({ width }).png().toBuffer();
    const m = await sharp(buf).metadata();
    return { buf, w: m.width ?? width, h: m.height ?? width };
  } catch {
    return null;
  }
}

export type SlideKind = "cover" | "node" | "cta";

export interface Slide {
  kind: SlideKind;
  master?: Buffer | null; // node photo / placeholder; null → gradient slide
  hue: number;
  kicker?: string | null; // small uppercase line above the title
  title: string;
  caption?: string | null; // supporting talkpoint line(s)
  index: number; // 1-based
  total: number;
}

// Shared footer (brand) + slide counter, drawn on every slide for continuity.
function footerSvg(brand: SetBrand, accent: string, index: number, total: number): string {
  const fy = CH - 52;
  const ident = esc([brand.name, brand.phone].filter(Boolean).join("  •  "));
  const counter = `${index}/${total}`;
  const cw = 86, ch = 46, cx = CW - PAD - cw, cy = CH - 74;
  const wm = brand.watermark
    ? `<text x="${CW / 2}" y="${fy}" font-family="sans-serif" font-size="24" fill="rgba(255,255,255,0.5)" text-anchor="middle" dominant-baseline="central">${esc(brand.watermark)}</text>`
    : "";
  return (
    `<circle cx="${PAD + 6}" cy="${fy - 8}" r="6" fill="${accent}"/>` +
    `<text x="${PAD + 22}" y="${fy}" font-family="sans-serif" font-size="30" font-weight="600" fill="rgba(255,255,255,0.92)" dominant-baseline="central">${ident}</text>` +
    wm +
    `<rect x="${cx}" y="${cy}" width="${cw}" height="${ch}" rx="23" fill="rgba(0,0,0,0.32)" stroke="${accent}" stroke-opacity="0.5"/>` +
    `<text x="${cx + cw / 2}" y="${cy + ch / 2 + 1}" font-family="sans-serif" font-size="26" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${counter}</text>`
  );
}

// Render one carousel slide (1080×1350) as a JPEG buffer.
async function renderSlide(s: Slide, brand: SetBrand): Promise<Buffer> {
  const accent = `hsl(${s.hue},80%,64%)`;
  const base = s.master
    ? await sharp(s.master).rotate().resize(CW, CH, { fit: "cover" }).jpeg({ quality: 84 }).toBuffer()
    : await sharp(Buffer.from(gradientSvg(CW, CH, s.hue))).jpeg({ quality: 90 }).toBuffer();

  let body = "";
  if (s.kind === "node") {
    // Bottom scrim + text panel: kicker → title → caption.
    const title = wrap(s.title, 22, 2);
    const caption = s.caption ? wrap(s.caption, 34, 3) : [];
    const tSize = 62, cSize = 34, kSize = 28;
    const blockH = (s.kicker ? kSize + 18 : 0) + title.length * tSize * 1.1 + (caption.length ? 14 + caption.length * cSize * 1.28 : 0);
    let y = CH - 150 - blockH;
    const kickerSvg = s.kicker
      ? `<text x="${PAD}" y="${y}" font-family="sans-serif" font-size="${kSize}" font-weight="700" letter-spacing="3" fill="${accent}">${esc(s.kicker.toUpperCase())}</text>`
      : "";
    if (s.kicker) y += kSize + 18;
    const titleSvg = title
      .map((ln, i) => `<text x="${PAD}" y="${y + i * tSize * 1.1 + tSize * 0.4}" font-family="sans-serif" font-size="${tSize}" font-weight="800" fill="#ffffff">${esc(ln)}</text>`)
      .join("");
    y += title.length * tSize * 1.1 + 14;
    const capSvg = caption
      .map((ln, i) => `<text x="${PAD}" y="${y + i * cSize * 1.28 + cSize * 0.4}" font-family="sans-serif" font-size="${cSize}" fill="rgba(255,255,255,0.86)">${esc(ln)}</text>`)
      .join("");
    body = `<rect x="0" y="${CH * 0.34}" width="${CW}" height="${CH * 0.66}" fill="url(#scrim)"/>${kickerSvg}${titleSvg}${capSvg}`;
  } else if (s.kind === "cover") {
    // Centred hero: kicker (project) → big title → caption + swipe hint.
    const title = wrap(s.title, 16, 3);
    const tSize = 84;
    const blockH = title.length * tSize * 1.08;
    let y = CH / 2 - blockH / 2;
    const kickerSvg = s.kicker
      ? `<text x="${CW / 2}" y="${y - 56}" font-family="sans-serif" font-size="32" font-weight="700" letter-spacing="6" fill="${accent}" text-anchor="middle">${esc(s.kicker.toUpperCase())}</text>`
      : "";
    const titleSvg = title
      .map((ln, i) => `<text x="${CW / 2}" y="${y + i * tSize * 1.08 + tSize * 0.5}" font-family="sans-serif" font-size="${tSize}" font-weight="800" fill="#ffffff" text-anchor="middle">${esc(ln)}</text>`)
      .join("");
    y += blockH;
    const rule = `<rect x="${CW / 2 - 44}" y="${y + 24}" width="88" height="6" rx="3" fill="${accent}"/>`;
    const cap = s.caption
      ? `<text x="${CW / 2}" y="${y + 84}" font-family="sans-serif" font-size="36" fill="rgba(255,255,255,0.84)" text-anchor="middle">${esc(s.caption)}</text>`
      : "";
    const hint = `<text x="${CW / 2}" y="${CH - 150}" font-family="sans-serif" font-size="30" fill="rgba(255,255,255,0.7)" text-anchor="middle">Vuốt để xem →</text>`;
    body = `<rect width="${CW}" height="${CH}" fill="rgba(0,0,0,0.18)"/>${kickerSvg}${titleSvg}${rule}${cap}${hint}`;
  } else {
    // CTA: closing card — headline → name → phone → zalo.
    const lines: { t: string; size: number; weight: number; fill: string; gap: number }[] = [
      { t: s.title, size: 60, weight: 800, fill: "#ffffff", gap: 92 },
      { t: brand.name, size: 44, weight: 700, fill: accent, gap: 64 },
      { t: `📞 ${brand.phone}`, size: 40, weight: 600, fill: "rgba(255,255,255,0.92)", gap: 56 },
    ];
    if (brand.zalo) lines.push({ t: `Zalo: ${brand.zalo}`, size: 36, weight: 500, fill: "rgba(255,255,255,0.8)", gap: 0 });
    const totalH = lines.reduce((a, l) => a + l.gap, 0);
    let y = CH / 2 - totalH / 2;
    const text = lines
      .map((l) => { const svg = `<text x="${CW / 2}" y="${y}" font-family="sans-serif" font-size="${l.size}" font-weight="${l.weight}" fill="${l.fill}" text-anchor="middle" dominant-baseline="central">${esc(l.t)}</text>`; y += l.gap; return svg; })
      .join("");
    body = `<rect width="${CW}" height="${CH}" fill="rgba(0,0,0,0.22)"/>${text}`;
  }

  const svg = `<svg width="${CW}" height="${CH}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#05070d" stop-opacity="0"/>
      <stop offset="1" stop-color="#05070d" stop-opacity="0.82"/>
    </linearGradient></defs>
    ${body}
    ${footerSvg(brand, accent, s.index, s.total)}
  </svg>`;

  const layers: sharp.OverlayOptions[] = [{ input: Buffer.from(svg), top: 0, left: 0 }];
  if (brand.logo) {
    const lg = await logoLayer(brand.logo, 132);
    if (lg) layers.push({ input: lg.buf, top: 44, left: PAD });
  }
  return sharp(base).composite(layers).jpeg({ quality: 84 }).toBuffer();
}

// Build the full carousel: an ordered set of JPEG slides.
export async function buildCarousel(slides: Slide[], brand: SetBrand): Promise<Buffer[]> {
  return Promise.all(slides.map((s) => renderSlide(s, brand)));
}

export interface CollageItem { master: Buffer; label: string }

// Grid rects for 2–4 cells within a content area (gap-separated).
function gridRects(n: number, x: number, y: number, w: number, h: number, gap: number) {
  const half = (d: number) => (d - gap) / 2;
  if (n <= 2) {
    const cw = half(w);
    return [
      { x, y, w: cw, h },
      { x: x + cw + gap, y, w: cw, h },
    ].slice(0, n);
  }
  const ch = half(h);
  if (n === 3) {
    const cw = half(w);
    return [
      { x, y, w, h: ch }, // top spans full width
      { x, y: y + ch + gap, w: cw, h: ch },
      { x: x + cw + gap, y: y + ch + gap, w: cw, h: ch },
    ];
  }
  const cw = half(w);
  return [
    { x, y, w: cw, h: ch },
    { x: x + cw + gap, y, w: cw, h: ch },
    { x, y: y + ch + gap, w: cw, h: ch },
    { x: x + cw + gap, y: y + ch + gap, w: cw, h: ch },
  ];
}

// Build a single 1080×1080 collage of 2–4 node photos with a title band and
// branding footer. Returns a JPEG buffer.
export async function buildCollage(
  items: CollageItem[],
  brand: SetBrand,
  opts: { title?: string | null; hue?: number } = {},
): Promise<Buffer> {
  const S = 1080;
  const hue = opts.hue ?? 215;
  const accent = `hsl(${hue},80%,64%)`;
  const topH = opts.title ? 132 : 24;
  const footH = 92;
  const gap = 10;
  const area = { x: 24, y: topH, w: S - 48, h: S - topH - footH };
  const cells = gridRects(Math.min(items.length, 4), area.x, area.y, area.w, area.h, gap);

  const base = await sharp(Buffer.from(gradientSvg(S, S, hue))).jpeg({ quality: 90 }).toBuffer();
  const layers: sharp.OverlayOptions[] = [];
  const chips: string[] = [];

  for (let i = 0; i < cells.length; i++) {
    const c = cells[i];
    const photo = await sharp(items[i].master).rotate().resize(Math.round(c.w), Math.round(c.h), { fit: "cover" }).jpeg({ quality: 84 }).toBuffer();
    layers.push({ input: photo, top: Math.round(c.y), left: Math.round(c.x) });
    // Label chip bottom-left of each cell.
    const label = wrap(items[i].label, 26, 1)[0] ?? items[i].label;
    const chW = Math.min(c.w - 24, label.length * 18 + 36);
    const chX = c.x + 16, chY = c.y + c.h - 58;
    chips.push(
      `<rect x="${chX}" y="${chY}" width="${chW}" height="42" rx="21" fill="rgba(5,7,13,0.66)"/>` +
      `<text x="${chX + 18}" y="${chY + 22}" font-family="sans-serif" font-size="24" font-weight="600" fill="#ffffff" dominant-baseline="central">${esc(label)}</text>`,
    );
  }

  const titleSvg = opts.title
    ? `<text x="48" y="84" font-family="sans-serif" font-size="56" font-weight="800" fill="#ffffff">${esc(wrap(opts.title, 28, 1)[0] ?? opts.title)}</text>`
    : "";
  const ident = esc([brand.name, brand.phone].filter(Boolean).join("  •  "));
  const wm = brand.watermark
    ? `<text x="${S / 2}" y="${S - 44}" font-family="sans-serif" font-size="24" fill="rgba(255,255,255,0.5)" text-anchor="middle" dominant-baseline="central">${esc(brand.watermark)}</text>`
    : "";
  const footer =
    `<circle cx="54" cy="${S - 44}" r="6" fill="${accent}"/>` +
    `<text x="72" y="${S - 44}" font-family="sans-serif" font-size="30" font-weight="600" fill="rgba(255,255,255,0.92)" dominant-baseline="central">${ident}</text>` +
    wm;

  const overlay = `<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${titleSvg}${chips.join("")}${footer}</svg>`;
  layers.push({ input: Buffer.from(overlay), top: 0, left: 0 });

  if (brand.logo) {
    const lg = await logoLayer(brand.logo, 96);
    if (lg) layers.push({ input: lg.buf, top: Math.max(0, Math.round(S - 46 - lg.h / 2)), left: S - 40 - lg.w });
  }
  return sharp(base).composite(layers).jpeg({ quality: 86 }).toBuffer();
}
