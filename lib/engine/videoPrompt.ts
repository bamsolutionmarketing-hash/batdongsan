import type { ComposeTone } from "@/types/domain";
import {
  verifiedDataBlock, variableLegend, contactLine,
  type ComposeNode, type ComposeLink, type ComposeProject, type ComposeBranding,
} from "./promptComposer";
import {
  VIDEO_PROMPT_VERSION, VIDEO_ROLE_HEADER, FORMAT_GUIDE, VIDEO_TONE_GUIDE,
  lengthPlan, VIDEO_RULES, VIDEO_OUTPUT_CONTRACT, getScriptTemplate, DEFAULT_TEMPLATE_ID,
  type VideoFormat, type VideoLength,
} from "./videoTemplates";

export { VIDEO_PROMPT_VERSION };
export type { VideoFormat, VideoLength };

export interface VideoPromptInput {
  format: VideoFormat;
  length: VideoLength;
  tone: ComposeTone;
  template?: string; // script-template id (kịch bản); defaults to "tong_quan"
  caption: string; // the assembled post — content backbone to adapt into video
  project: ComposeProject;
  nodes: ComposeNode[];
  links?: ComposeLink[];
  branding: ComposeBranding;
}

// Compose the short-video SCRIPT mega-prompt. Pure, rule-based, NO AI call.
// The agent pastes this into any AI chat to get a ready-to-shoot storyboard,
// constrained to the same verified-data spine as the post engine.
export function composeVideoPrompt(input: VideoPromptInput): string {
  const { format, length, tone, caption, project, nodes, links, branding } = input;
  const tpl = getScriptTemplate(input.template ?? DEFAULT_TEMPLATE_ID);

  const block1 = verifiedDataBlock(project, nodes, links);
  const legend = variableLegend(`${caption} [TEN_SALE] [SDT]`, project, branding);
  const contact = contactLine(branding);

  const parts: (string | null)[] = [
    VIDEO_ROLE_HEADER,
    "",
    block1,
    ...(legend ? ["", legend] : []),
    "",
    "② NỘI DUNG NỀN (bài đăng đã dựng — chuyển thể sang lời thoại video, KHÔNG thêm dữ kiện mới)",
    caption,
    "",
    "③ ĐỊNH DẠNG & CẤU TRÚC",
    `Kênh: ${FORMAT_GUIDE[format]}`,
    `Dạng kịch bản — ${tpl.label}: ${tpl.arc}`,
    `Gợi ý hook: ${tpl.hook}`,
    `Nhịp & độ dài: ${lengthPlan(length)}`,
    "",
    "④ GIỌNG",
    VIDEO_TONE_GUIDE[tone],
    "",
    "⑤ " + VIDEO_RULES,
    contact ? `- Liên hệ ở CTA: ${contact}` : null,
    "",
    "⑥ ĐẦU RA",
    VIDEO_OUTPUT_CONTRACT,
  ];
  return parts.filter((l): l is string => l !== null).join("\n");
}
