import type { ComposeMode, ComposeTone, Fact } from "@/types/domain";
import { MODE_FORMULA, MODE_FORMAT, TONE_GUIDE, RULES, PROMPT_VERSION } from "./promptTemplates";

export { PROMPT_VERSION };

export interface ComposeInput {
  mode: ComposeMode;
  tone: ComposeTone;
  caption: string;
  project: { name?: string | null; locationText?: string | null };
  nodes: { label: string; facts: Fact[] }[];
  branding: { displayName?: string | null; phone?: string | null; zalo?: string | null };
}

// A fact counts as verified when it has no explicit confidence (our seeds) or
// confidence === "verified". Only these enter block ① — by architecture the
// model never sees weaker facts, so it cannot cite them.
const isVerified = (f: Fact) => (f.confidence ?? "verified") === "verified";

// Compose the 6-block mega-prompt. Pure, server-safe, NO AI call.
export function composePrompt(input: ComposeInput): string {
  const { mode, tone, caption, project, nodes, branding } = input;

  const factLines: string[] = [];
  for (const n of nodes) {
    const vf = n.facts.filter(isVerified);
    if (vf.length === 0) continue;
    factLines.push(`- ${n.label}: ${vf.map((f) => `${f.key}: ${f.value}`).join("; ")}`);
  }
  const contact = [branding.displayName, branding.phone].filter(Boolean).join(" — ");

  return [
    "① DỮ LIỆU ĐÃ XÁC THỰC" + (project.name ? ` (${project.name})` : ""),
    factLines.length ? factLines.join("\n") : "(không có)",
    "",
    "② BÀI GỐC",
    caption,
    "",
    "③ CÔNG THỨC VIẾT",
    MODE_FORMULA[mode],
    "",
    "④ GIỌNG VĂN",
    TONE_GUIDE[tone],
    "",
    `⑤ ${RULES}`,
    contact ? `- Liên hệ giữ nguyên: ${contact}` : "",
    "",
    "⑥ ĐỊNH DẠNG ĐẦU RA",
    MODE_FORMAT[mode],
  ]
    .filter((l) => l !== "")
    .join("\n");
}
