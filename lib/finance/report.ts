import "server-only";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { getBranding } from "@/lib/repo/branding";
import { DISCLAIMER } from "./disclaimer";
import type { ReportTable, ReportPayload } from "./types";

export type { ReportTable, ReportPayload };

// Customer-facing PDF report. Each A4 page is rendered as a PNG via sharp (so
// Vietnamese + styling are pixel-perfect, no font embedding) then stitched into
// a real .pdf with pdf-lib. Pure-JS, works anywhere sharp does.

const W = 1240;
const H = 1754; // A4 @ ~150dpi, portrait (1 : 1.414)
const M = 80; // page margin
const ROWS_PER_PAGE = 30;

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function wrap(s: string, max: number, maxLines = 3): string[] {
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

interface Brand {
  name: string;
  phone: string;
}

// Shared page chrome: accent bar, footer disclaimer + brand + page number.
function chrome(brand: Brand, pageNo: number, totalPages: number): string {
  const disc = wrap(DISCLAIMER, 110, 2)
    .map((l, i) => `<text x="${M}" y="${H - 70 + i * 26}" font-size="18" fill="#64748b" font-family="DejaVu Sans, sans-serif">${esc(l)}</text>`)
    .join("");
  return `
    <rect x="0" y="0" width="${W}" height="10" fill="#38bdf8"/>
    <line x1="${M}" y1="${H - 96}" x2="${W - M}" y2="${H - 96}" stroke="#e2e8f0" stroke-width="1"/>
    ${disc}
    <text x="${W - M}" y="${H - 44}" font-size="18" fill="#94a3b8" text-anchor="end" font-family="DejaVu Sans, sans-serif">Trang ${pageNo}/${totalPages} • ${esc(brand.name)} — ${esc(brand.phone)}</text>`;
}

async function svgToPng(svg: string): Promise<Buffer> {
  return sharp(Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${svg}</svg>`))
    .png()
    .toBuffer();
}

// Page 1 — header, explanation bullets, key-figure box.
async function summaryPage(p: ReportPayload, brand: Brand, pageNo: number, total: number): Promise<Buffer> {
  let y = 150;
  const head = `
    <rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>
    <text x="${M}" y="90" font-size="24" fill="#38bdf8" font-family="DejaVu Sans, sans-serif">📊 BÁO CÁO DỰ TÍNH TÀI CHÍNH</text>
    <text x="${M}" y="140" font-size="44" font-weight="bold" fill="#0f172a" font-family="DejaVu Sans, sans-serif">${esc(p.title)}</text>
    ${p.subtitle ? `<text x="${M}" y="182" font-size="26" fill="#0284c7" font-family="DejaVu Sans, sans-serif">${esc(p.subtitle)}</text>` : ""}`;
  y = p.subtitle ? 240 : 210;

  // explanation bullets
  let bulletsSvg = `<text x="${M}" y="${y}" font-size="24" font-weight="bold" fill="#0f172a" font-family="DejaVu Sans, sans-serif">Giải thích</text>`;
  y += 44;
  for (const b of p.bullets) {
    const lines = wrap(b, 96, 3);
    lines.forEach((l, i) => {
      bulletsSvg += `<text x="${M + (i === 0 ? 0 : 28)}" y="${y}" font-size="22" fill="#334155" font-family="DejaVu Sans, sans-serif">${i === 0 ? "• " : ""}${esc(l)}</text>`;
      y += 34;
    });
    y += 8;
  }

  // key-figure box
  y += 20;
  let box = `<text x="${M}" y="${y}" font-size="24" font-weight="bold" fill="#0f172a" font-family="DejaVu Sans, sans-serif">Chỉ số chính</text>`;
  y += 30;
  const boxTop = y;
  p.summary.forEach((s, i) => {
    const ry = boxTop + i * 56;
    box += `
      <rect x="${M}" y="${ry}" width="${W - 2 * M}" height="52" fill="${i % 2 ? "#f8fafc" : "#eff6ff"}"/>
      <text x="${M + 24}" y="${ry + 34}" font-size="24" fill="#475569" font-family="DejaVu Sans, sans-serif">${esc(s.label)}</text>
      <text x="${W - M - 24}" y="${ry + 34}" font-size="26" font-weight="bold" fill="#0f172a" text-anchor="end" font-family="DejaVu Sans, sans-serif">${esc(s.value)}</text>`;
  });

  return svgToPng(head + bulletsSvg + box + chrome(brand, pageNo, total));
}

// Render a slice of table rows as one page.
function tablePageSvg(t: ReportTable, slice: string[][], brand: Brand, pageNo: number, total: number, first: boolean): string {
  const cols = t.head.length;
  const innerW = W - 2 * M;
  const colW = innerW / cols;
  const cellX = (c: number, right: boolean) => (right ? M + (c + 1) * colW - 16 : M + c * colW + 16);
  const anchor = (c: number) => (c === 0 ? "start" : "end");

  let y = 110;
  let svg = `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`;
  if (first) {
    svg += `<text x="${M}" y="${y}" font-size="32" font-weight="bold" fill="#0f172a" font-family="DejaVu Sans, sans-serif">${esc(t.heading)}</text>`;
    y += 40;
  } else {
    svg += `<text x="${M}" y="${y}" font-size="26" fill="#64748b" font-family="DejaVu Sans, sans-serif">${esc(t.heading)} (tiếp)</text>`;
    y += 34;
  }

  // column header
  svg += `<rect x="${M}" y="${y}" width="${innerW}" height="48" fill="#0f172a"/>`;
  t.head.forEach((h, c) => {
    svg += `<text x="${cellX(c, c !== 0)}" y="${y + 32}" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="${anchor(c)}" font-family="DejaVu Sans, sans-serif">${esc(h)}</text>`;
  });
  y += 48;

  // data rows
  slice.forEach((row, ri) => {
    svg += `<rect x="${M}" y="${y}" width="${innerW}" height="42" fill="${ri % 2 ? "#f1f5f9" : "#ffffff"}"/>`;
    row.forEach((cell, c) => {
      svg += `<text x="${cellX(c, c !== 0)}" y="${y + 28}" font-size="20" fill="#1e293b" text-anchor="${anchor(c)}" font-family="DejaVu Sans, sans-serif">${esc(cell)}</text>`;
    });
    y += 42;
  });

  return svg + chrome(brand, pageNo, total);
}

// Public entry: resolve branding, render every page, return the PDF bytes.
// null when branding (name + phone) isn't set up.
export async function buildReportPdf(userId: string, payload: ReportPayload): Promise<Buffer | null> {
  const brandingRes = await getBranding(userId);
  const branding = brandingRes.ok ? brandingRes.data : null;
  if (!branding) return null;
  const brand: Brand = { name: branding.displayName, phone: branding.phone };

  // Pre-compute total page count: 1 summary + ceil(rows/page) per table.
  let total = 1;
  for (const t of payload.tables) total += Math.max(1, Math.ceil(t.rows.length / ROWS_PER_PAGE));

  const pages: Buffer[] = [];
  let pageNo = 1;
  pages.push(await summaryPage(payload, brand, pageNo, total));

  for (const t of payload.tables) {
    const chunks: string[][][] = t.rows.length === 0 ? [[]] : [];
    for (let i = 0; i < t.rows.length; i += ROWS_PER_PAGE) chunks.push(t.rows.slice(i, i + ROWS_PER_PAGE));
    for (let ci = 0; ci < chunks.length; ci++) {
      pageNo += 1;
      pages.push(await svgToPng(tablePageSvg(t, chunks[ci], brand, pageNo, total, ci === 0)));
    }
  }

  const pdf = await PDFDocument.create();
  pdf.setTitle(payload.title);
  for (const png of pages) {
    const img = await pdf.embedPng(png);
    const page = pdf.addPage([595.28, 841.89]); // A4 in points
    page.drawImage(img, { x: 0, y: 0, width: 595.28, height: 841.89 });
  }
  return Buffer.from(await pdf.save());
}
