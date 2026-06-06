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

export interface ComposeProject {
  name?: string | null;
  locationText?: string | null;
  phase?: string | null;
  priceText?: string | null;
}

export interface ComposeBranding {
  displayName?: string | null;
  phone?: string | null;
  zalo?: string | null;
}

export interface ComposeInput {
  mode: ComposeMode;
  tone: ComposeTone;
  caption: string;
  project: ComposeProject;
  nodes: ComposeNode[];
  links?: ComposeLink[];
  branding: ComposeBranding;
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

// ── shared builders (used by both the post and the video prompt) ────────────

// Block ①: verified data grouped by node, with angle + relationships. This is
// the single compliance gate — anything not here is invisible to the AI.
export function verifiedDataBlock(
  project: ComposeProject, nodes: ComposeNode[], links?: ComposeLink[],
): string {
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

  return [
    "① DỮ LIỆU ĐÃ XÁC THỰC — chỉ được dùng dữ kiện trong khối này",
    projMeta || null,
    nodeBlocks.length ? nodeBlocks.join("\n") : "(không có điểm nội dung)",
    relLines.length ? "QUAN HỆ GIỮA CÁC ĐIỂM:\n" + relLines.join("\n") : null,
  ].filter(Boolean).join("\n");
}

// Variable legend: known mappings + keep-verbatim instruction for [TOKENS] still
// present in the text. Returns "" when the text has no tokens.
export function variableLegend(
  text: string, project: ComposeProject, branding: ComposeBranding,
): string {
  const known: Record<string, string | null | undefined> = {
    TEN_DU_AN: project.name,
    TEN_SALE: branding.displayName,
    SDT: branding.phone,
    ZALO: branding.zalo,
    VI_TRI: project.locationText,
  };
  const present = tokensIn(text);
  if (!present.length) return "";
  const mapped = present
    .map((t) => (known[t] ? `[${t}] = ${known[t]}` : `[${t}] = (giữ nguyên ký hiệu)`))
    .join(" · ");
  return `KÝ HIỆU TRONG BÀI (thay đúng giá trị, nếu chưa biết thì GIỮ NGUYÊN ký hiệu):\n${mapped}`;
}

// Contact line kept intact at the end of the output.
export function contactLine(branding: ComposeBranding): string {
  return [branding.displayName, branding.phone, branding.zalo ? `Zalo ${branding.zalo}` : null]
    .filter(Boolean)
    .join(" — ");
}

// Compose the rigorous mega-prompt. Pure, server-safe, NO AI call.
// Output is a self-contained brief: any fresh AI chat can turn it into a
// standard-compliant VN real-estate post on the first paste.
export function composePrompt(input: ComposeInput): string {
  const { mode, tone, caption, project, nodes, links, branding } = input;

  const block1 = verifiedDataBlock(project, nodes, links);
  const legend = variableLegend(caption, project, branding);
  const contact = contactLine(branding);

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
