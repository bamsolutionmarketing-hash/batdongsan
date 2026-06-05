import type { ComposeMode, ComposeTone, Fact } from "@/types/domain";
import {
  MODE_FORMULA, MODE_FORMAT, TONE_GUIDE, RULES, OUTPUT_CONTRACT, ROLE_HEADER, PROMPT_VERSION,
} from "./promptTemplates";

export { PROMPT_VERSION };

export interface ComposeNode {
  label: string;
  facts: Fact[];
  talkpoint?: string | null; // author-written angle/positioning (no new numbers)
  subLabel?: string | null;
  category?: string | null;
}

export interface ComposeLink {
  from: string; // source node label
  label?: string | null; // relationship label (e.g. "chủ đầu tư", "gần")
  to: string; // target node label
}

export interface ComposeInput {
  mode: ComposeMode;
  tone: ComposeTone;
  caption: string;
  project: {
    name?: string | null;
    locationText?: string | null;
    phase?: string | null;
    priceText?: string | null;
  };
  nodes: ComposeNode[];
  links?: ComposeLink[];
  branding: { displayName?: string | null; phone?: string | null; zalo?: string | null };
}

// A fact counts as verified when it has no explicit confidence (our seeds) or
// confidence === "verified". Only these enter block ① — by architecture the
// model never sees weaker facts, so it cannot cite them.
const isVerified = (f: Fact) => (f.confidence ?? "verified") === "verified";

// Clean a talkpoint string: authors sometimes wrap it in quotes.
const cleanTalk = (t: string) => t.trim().replace(/^["“”']+|["“”']+$/g, "").trim();

// Detect [PLACEHOLDER] tokens still present in the caption so we can tell the
// receiving AI which to keep verbatim vs. which we already know the value of.
const TOKEN_RE = /\[([A-Z_]{2,})\]/g;
function tokensIn(s: string): string[] {
  const out = new Set<string>();
  for (const m of s.matchAll(TOKEN_RE)) out.add(m[1]);
  return [...out];
}

// Compose the rigorous mega-prompt. Pure, server-safe, NO AI call.
// Output is a self-contained brief: any fresh AI chat can turn it into a
// standard-compliant VN real-estate post on the first paste.
export function composePrompt(input: ComposeInput): string {
  const { mode, tone, caption, project, nodes, links, branding } = input;

  // ── ① verified data, grouped by node, with angle + relationships ──────────
  const projMeta = [
    project.name ? `Dự án: ${project.name}` : null,
    project.locationText ? `Vị trí: ${project.locationText}` : null,
    project.phase ? `Giai đoạn: ${project.phase}` : null,
    project.priceText ? `Giá: ${project.priceText}` : null,
  ].filter(Boolean).join(" · ");

  const nodeBlocks: string[] = [];
  for (const n of nodes) {
    const vf = n.facts.filter(isVerified);
    const head =
      `• ${n.label}` +
      (n.subLabel ? ` (${n.subLabel})` : "") +
      (n.talkpoint ? ` — góc kể: ${cleanTalk(n.talkpoint)}` : "");
    const factLines = vf.map((f) => `   - ${f.key}: ${f.value}`);
    nodeBlocks.push([head, ...factLines].join("\n"));
  }

  const relLines = (links ?? [])
    .map((l) => `   - ${l.from} —(${l.label ?? "liên quan"})→ ${l.to}`)
    .filter(Boolean);

  const block1 = [
    "① DỮ LIỆU ĐÃ XÁC THỰC — chỉ được dùng dữ kiện trong khối này",
    projMeta || null,
    nodeBlocks.length ? nodeBlocks.join("\n") : "(không có điểm nội dung)",
    relLines.length ? "QUAN HỆ GIỮA CÁC ĐIỂM:\n" + relLines.join("\n") : null,
  ].filter(Boolean).join("\n");

  // ── variable legend: known mappings + keep-verbatim instruction ───────────
  const known: Record<string, string | null | undefined> = {
    TEN_DU_AN: project.name,
    TEN_SALE: branding.displayName,
    SDT: branding.phone,
    ZALO: branding.zalo,
    VI_TRI: project.locationText,
  };
  const present = tokensIn(caption);
  let legend = "";
  if (present.length) {
    const mapped = present
      .map((t) => (known[t] ? `[${t}] = ${known[t]}` : `[${t}] = (giữ nguyên ký hiệu)`))
      .join(" · ");
    legend = `KÝ HIỆU TRONG BÀI (thay đúng giá trị, nếu chưa biết thì GIỮ NGUYÊN ký hiệu):\n${mapped}`;
  }

  // ── ⑤ contact line (kept intact in the output) ────────────────────────────
  const contact = [branding.displayName, branding.phone, branding.zalo ? `Zalo ${branding.zalo}` : null]
    .filter(Boolean)
    .join(" — ");

  // Assemble. `null` entries are dropped; "" entries are kept as blank lines.
  const parts: (string | null)[] = [
    ROLE_HEADER,
    "",
    block1,
    ...(legend ? ["", legend] : []),
    "",
    "② BÀI NHÁP (bộ máy dựng sẵn — dùng làm xương sống, viết lại cho mượt & đúng giọng)",
    caption,
    "",
    "③ CÔNG THỨC VIẾT",
    MODE_FORMULA[mode],
    "",
    "④ GIỌNG VĂN",
    TONE_GUIDE[tone],
    "",
    "⑤ " + RULES,
    contact ? `- Liên hệ giữ nguyên ở cuối bài: ${contact}` : null,
    "",
    "⑥ ĐỊNH DẠNG & ĐẦU RA",
    MODE_FORMAT[mode],
    OUTPUT_CONTRACT,
  ];
  return parts.filter((l): l is string => l !== null).join("\n");
}
