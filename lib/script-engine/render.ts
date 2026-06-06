import type { PickedNode, RenderedNode, ScriptLine, SlotMap } from "./types";
import { slotDef, humanizeSlot } from "./data/slots";
import { plannedSeconds } from "./budget";

const TOKEN_RE = /\{\{(\w+)\}\}/g;

// Resolve one {{token}} (R8): data value → registry fallback → editable
// placeholder. `n` is the per-body counter when provided.
function resolveToken(key: string, slots: SlotMap, localN?: number): string {
  if (key === "n" && localN != null) return String(localN);
  const v = slots.values[key];
  if (v != null && v !== "") return v;
  const fb = slotDef(key)?.fallbackText;
  if (fb) return fb;
  return humanizeSlot(key);
}

function substitute(str: string, slots: SlotMap, localN?: number): string {
  return str.replace(TOKEN_RE, (_, k) => resolveToken(k, slots, localN));
}

const wordCount = (s: string): number => (s.trim() ? s.trim().split(/\s+/).length : 0);

// Render every picked node's text/onscreen/visual. Body nodes get a 1-based
// counter (n); so_luong is set by the caller in slots.
export function renderNodes(items: PickedNode[], slots: SlotMap): RenderedNode[] {
  let bodyN = 0;
  return items.map((node) => {
    const isBody = node.type.startsWith("BODY_");
    const localN = isBody ? ++bodyN : undefined;
    return {
      ...node,
      text: substitute(node.text, slots, localN),
      onscreen: substitute(node.onscreen ?? "", slots, localN),
      visual: substitute(node.visual, slots, localN),
    };
  });
}

// 7.1 — two-column script with cumulative timestamps (each line ≤ ~8s).
export function renderTwoColumn(rendered: RenderedNode[]): ScriptLine[] {
  let t = 0;
  return rendered.map((n) => {
    const start = t;
    const end = t + plannedSeconds(n.duration);
    t = end;
    return { start, end, visual: n.visual, speech: n.text, overlay: n.onscreen };
  });
}

// strip Vietnamese diacritics → ascii slug for hashtags.
function viSlug(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// 7.2 — caption = hook (rút gọn) + payoff + CTA keyword + hashtag set(5).
export function renderCaption(
  rendered: RenderedNode[],
  slots: SlotMap,
): { text: string; hashtags: string[] } {
  const hook = rendered.find((n) => n.type === "HOOK");
  const payoff = rendered.find((n) => n.type === "PAYOFF");
  const cta = rendered.find((n) => n.type === "CTA");
  const text = [hook?.text, payoff?.text, cta?.text].filter(Boolean).join(" ");

  const v = slots.values;
  const tags = ["#batdongsan"];
  for (const key of ["loai_hinh", "khu_vuc", "du_an"]) {
    const slug = v[key] ? "#" + viSlug(v[key]) : "";
    if (slug && slug.length > 1) tags.push(slug);
  }
  if (v.nam) tags.push("#muanha" + viSlug(v.nam));
  const hashtags = Array.from(new Set(tags)).slice(0, 5);
  return { text, hashtags };
}

// 7.3 — shotlist: deduped visuals with seconds + rough shoot estimate.
export function renderShotlist(rendered: RenderedNode[]): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();
  let shot = 0;
  for (const n of rendered) {
    const key = n.visual.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    shot++;
    lines.push(`□ Cảnh ${shot}: ${n.visual} (${plannedSeconds(n.duration)}s)`);
  }
  lines.push(`→ Tổng ${shot} cảnh — quay 1 buổi, dựng theo timestamp ở kịch bản 2 cột.`);
  return lines;
}

// Total spoken words across the script (R3 check).
export function totalWords(rendered: RenderedNode[]): number {
  return rendered.reduce((s, n) => s + wordCount(n.text), 0);
}
