// Deterministic seeding (R9). hash(parts) → hex; rng(seed) → reproducible
// number stream; seededPick → weighted choice. Same seed ⇒ same output (P4).

export function hashSeed(parts: (string | number)[]): string {
  // FNV-1a over the joined parts.
  let h = 0x811c9dc5;
  const s = parts.join(":");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

// mulberry32 PRNG seeded from a hex string.
export function rng(seed: string): () => number {
  let a = parseInt(seed.slice(0, 8), 16) || 1;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Weighted pick from a pre-filtered candidate pool. Deterministic given `rand`.
export function seededPick<T>(items: { item: T; weight: number }[], rand: () => number): T | null {
  if (items.length === 0) return null;
  const total = items.reduce((s, i) => s + Math.max(0, i.weight), 0);
  if (total <= 0) return items[Math.floor(rand() * items.length)].item;
  let r = rand() * total;
  for (const it of items) {
    r -= Math.max(0, it.weight);
    if (r <= 0) return it.item;
  }
  return items[items.length - 1].item;
}
