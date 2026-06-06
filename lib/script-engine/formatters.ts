// Vietnamese slot formatters (Spec 2.3.6). Pure; accept number|string.

// vi decimal uses a comma; trim trailing zero decimals ("3,0" → "3").
function viNum(x: number, decimals = 1): string {
  const fixed = x.toFixed(decimals);
  const trimmed = fixed.replace(/\.?0+$/, ""); // 3.20 → 3.2 → "3.2"; 3.00 → "3"
  return trimmed.replace(".", ",");
}

const num = (v: number | string): number =>
  typeof v === "number" ? v : Number(String(v).replace(/[^\d.-]/g, ""));

export function fmt_ty(v: number | string): string {
  return `${viNum(num(v) / 1_000_000_000, 1)} tỷ`;
}

export function fmt_trieu(v: number | string): string {
  return `${viNum(num(v) / 1_000_000, 1)} triệu`;
}

export function fmt_m2(v: number | string): string {
  return `${viNum(num(v), 1)}m²`;
}

export function fmt_quy(v: string | Date): string {
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `Q${q}/${d.getFullYear()}`;
}

export function fmt_pct(v: number | string): string {
  let n = num(v);
  if (Math.abs(n) <= 1.5) n = n * 100; // 0.12 → 12 ; 12 stays 12
  return `${viNum(n, 1)}%`;
}

export const FORMATTERS: Record<string, (v: number | string) => string> = {
  fmt_ty,
  fmt_trieu,
  fmt_m2,
  fmt_quy: (v) => fmt_quy(v as string),
  fmt_pct,
};

// Apply a named formatter if present, else stringify.
export function applyFormatter(name: string | undefined, value: unknown): string {
  if (value == null) return "";
  if (name && FORMATTERS[name]) {
    try {
      return FORMATTERS[name](value as number | string);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
