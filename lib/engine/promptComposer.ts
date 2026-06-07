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

// ── video script → AI prompt ────────────────────────────────────────────────

export interface ScriptPromptLine {
  start: number;
  end: number;
  visual: string;
  speech: string;
  overlay: string;
}

export interface ComposeScriptInput {
  platform: string; // tiktok | reels | shorts (or label)
  durationS: number;
  contentTypeName?: string | null; // recipe name (vi)
  projectName?: string | null;
  script: ScriptPromptLine[];
  caption?: { text: string; hashtags: string[] } | null;
  checklist?: string[] | null;
  // Coherence guidance (single through-line) ────────────────────────────────
  angle?: { label: string; guide: string; arc: string } | null; // góc nhìn chủ đạo
  project?: ComposeProject | null; // for the verified-data block
  nodes?: ComposeNode[] | null; // verified facts per node — the single data gate
  links?: ComposeLink[] | null; // relationships between nodes
  maxPoints?: number; // tối đa số ý chính (default 3)
}

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok", reels: "Reels (Instagram)", shorts: "YouTube Shorts",
};

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

const durationLabel = (s: number): string =>
  s >= 60 && s % 60 === 0 ? `~${s / 60} phút (${s}s)` : `~${s}s`;

// Wrap a generated video script into a self-contained brief that any external
// generative-AI app can turn into a finished, COHERENT short-video script on
// first paste. Encodes a single góc nhìn + verified data + narrative arc +
// mandatory transitions, mirroring the post mega-prompt's compliance spine
// (no new numbers / no profit promises). Pure; NO AI call.
export function composeScriptPrompt(input: ComposeScriptInput): string {
  const platform = PLATFORM_LABEL[input.platform] ?? input.platform;
  const maxPoints = input.maxPoints ?? 3;
  const durLabel = durationLabel(input.durationS);

  const meta = [
    `Nền tảng: ${platform}`,
    `Thời lượng: ${durLabel}`,
    input.contentTypeName ? `Dạng nội dung: ${input.contentTypeName}` : null,
    input.projectName ?? input.project?.name ? `Dự án: ${input.projectName ?? input.project?.name}` : null,
  ].filter(Boolean).join(" · ");

  const scriptBlock = input.script.length
    ? input.script
        .map((l) => `[${l.start}–${l.end}s]\nHÌNH: ${l.visual}\nTIẾNG: ${l.speech}\nOVERLAY: ${l.overlay}`)
        .join("\n\n")
    : "(chưa có phân cảnh)";

  // Reuse the post's verified-data block (drop its built-in header — we number
  // sections dynamically here).
  const dataBody = input.nodes?.length
    ? verifiedDataBlock(input.project ?? { name: input.projectName ?? null }, input.nodes, input.links ?? undefined)
        .split("\n").slice(1).join("\n")
    : null;

  const arc = input.angle?.arc
    ?? "Hook → bối cảnh → 2–3 ý chính (mỗi ý có dẫn chứng + câu chuyển ý) → chốt đúng lời hứa của hook → CTA.";

  const sections: { h: string; body: string }[] = [];
  if (input.angle) {
    sections.push({
      h: "GÓC NHÌN CHỦ ĐẠO",
      body: `${input.angle.label} — ${input.angle.guide}\n→ Cả video CHỈ xoay quanh góc nhìn này; bỏ mọi ý lạc đề.`,
    });
  }
  if (dataBody) {
    sections.push({ h: "DỮ LIỆU ĐÃ XÁC THỰC — chỉ được dùng dữ kiện trong khối này", body: dataBody });
  }
  sections.push({ h: "KỊCH BẢN 2 CỘT (xương sống — viết lại cho mượt, đúng giọng)", body: scriptBlock });
  sections.push({
    h: "CẤU TRÚC & MẠCH KỂ",
    body: [
      `- Tối đa ${maxPoints} ý chính, mỗi ý một thông điệp rõ — KHÔNG nhảy chủ đề.`,
      `- Mạch kể: ${arc}`,
      "- Mỗi ý: nêu ý → 1 dẫn chứng (chỉ lấy số ở khối dữ liệu) → CÂU CHUYỂN Ý sang phần sau (vd: “Không chỉ vậy…”, “Quan trọng hơn…”, “Nhiều người lo… nhưng…”).",
      "- Mở đầu bằng hook bám đúng góc nhìn; kết bằng chốt đúng lời hứa của hook.",
      `- Phát triển cho ĐỦ ${durLabel}: đào sâu từng ý (ví dụ, cảm xúc, lợi ích), KHÔNG thêm chủ đề mới chỉ để lấp giờ.`,
    ].join("\n"),
  });
  if (input.caption) {
    sections.push({ h: "CAPTION & HASHTAG", body: [input.caption.text, input.caption.hashtags.join(" ")].filter(Boolean).join("\n") });
  }
  if (input.checklist?.length) {
    sections.push({ h: "CHECKLIST QUAY", body: input.checklist.join("\n") });
  }
  sections.push({
    h: "QUY TẮC BẮT BUỘC",
    body: [
      "- Giữ NGUYÊN 100% con số, mốc thời gian, tên riêng có trong dữ liệu/kịch bản.",
      "- KHÔNG thêm số liệu/giá/diện tích/tiện ích/pháp lý nào ngoài dữ liệu đã cho.",
      "- KHÔNG hứa lợi nhuận, KHÔNG cam kết tăng giá.",
      "- Câu văn liền mạch, có câu chuyển ý; giữ MỘT góc nhìn xuyên suốt.",
    ].join("\n"),
  });
  sections.push({
    h: "ĐẦU RA",
    body: [
      "- Trả về kịch bản hoàn chỉnh: phân cảnh theo mốc thời gian, lời thoại/voiceover, gợi ý hình ảnh & góc quay, chữ overlay, và caption.",
      "- CHỈ in nội dung; KHÔNG thêm lời dẫn/giải thích; KHÔNG bọc trong dấu ```.",
    ].join("\n"),
  });

  const head = [
    "Bạn là biên kịch kiêm đạo diễn video ngắn bất động sản tại Việt Nam.",
    "Nhiệm vụ: dựa trên các khối dưới đây, viết kịch bản quay video ngắn HOÀN CHỈNH, liền mạch, đúng một góc nhìn.",
    "RÀNG BUỘC CỐT LÕI: chỉ dùng dữ kiện có trong các khối dưới; không thêm thông tin mới.",
  ];
  if (meta) head.push("", meta);

  const body = sections.map((s, i) => `${CIRCLED[i] ?? `(${i + 1})`} ${s.h}\n${s.body}`).join("\n\n");
  return [...head, "", body].join("\n");
}
