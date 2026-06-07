// VND formatting helpers. Vietnamese convention: "." groups thousands, "," is
// the decimal separator. compactVnd renders the way agents speak (tỷ / triệu).

const round = (n: number, d = 0) => {
  const p = Math.pow(10, d);
  return Math.round(n * p) / p;
};

// Full amount with thousands separators + " đ", e.g. 2500000000 → "2.500.000.000 đ".
export function vnd(n: number): string {
  const v = Math.round(n);
  return `${v.toLocaleString("vi-VN")} đ`;
}

// Spoken/compact form: "2,5 tỷ", "850 triệu", "12,3 triệu". Drops trailing ",0".
export function compactVnd(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${trim(round(abs / 1_000_000_000, 2))} tỷ`;
  if (abs >= 1_000_000) return `${sign}${trim(round(abs / 1_000_000, 1))} triệu`;
  if (abs >= 1_000) return `${sign}${trim(round(abs / 1_000, 0))} nghìn`;
  return `${sign}${trim(round(abs, 0))} đ`;
}

// Number → vi-VN string, trimming a trailing ",0"/",00".
function trim(n: number): string {
  return n.toLocaleString("vi-VN", { maximumFractionDigits: 2 });
}

export function pct(n: number, d = 1): string {
  return `${n.toLocaleString("vi-VN", { maximumFractionDigits: d })}%`;
}
