import type { Project, Segment } from "../data/types";

export type ContentFormat = "facebook_post" | "short_caption";

export interface ContentInput {
  project: Project;
  amenities?: string[];
}

export interface GeneratedContent {
  format: ContentFormat;
  body: string;
  /** Facts used, for provenance/trust. */
  usedFacts: string[];
  /** Required slots with no supporting fact — caller warns the admin. */
  missingSlots: string[];
}

const SEGMENT_VI: Record<Segment, string> = {
  luxury: "hạng sang",
  "high-end": "cao cấp",
  "mid-range": "trung cấp",
  affordable: "bình dân",
};

// Build a hashtag-safe token from free text (drop diacritics + non-alphanumerics).
function tag(text: string): string {
  const folded = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9]/g, "");
  return folded ? `#${folded}` : "";
}

// Slot-fill a Facebook post from confirmed facts. Never invents prose: lines are
// only added when the supporting fact exists. `missingSlots` flags required
// facts (name, district) that are absent so the admin fills them in.
export function generateFacebookPost(input: ContentInput): GeneratedContent {
  const { project, amenities = [] } = input;
  const used: string[] = [];
  const missing: string[] = [];
  const lines: string[] = [];

  if (project.name) {
    const loc = project.district ? ` — ${project.district}` : "";
    lines.push(`🏙️ ${project.name}${loc}`);
    used.push(`Tên: ${project.name}`);
  } else {
    missing.push("name");
  }
  if (!project.district) missing.push("district");

  if (project.pricePerSqmM > 0) {
    lines.push(`💰 Giá chỉ từ ${project.pricePerSqmM} triệu/m²`);
    used.push(`Giá: ${project.pricePerSqmM} tr/m²`);
  }

  if (project.developer) {
    lines.push(`🏗️ Phát triển bởi ${project.developer}`);
    used.push(`Chủ đầu tư: ${project.developer}`);
  }

  if (project.segment) {
    lines.push(`✨ Phân khúc ${SEGMENT_VI[project.segment]}`);
    used.push(`Phân khúc: ${SEGMENT_VI[project.segment]}`);
  }

  if (amenities.length > 0) {
    const top = amenities.slice(0, 4);
    lines.push(top.map((a) => `✅ ${a}`).join("  "));
    used.push(`Tiện ích: ${amenities.join(", ")}`);
  }

  lines.push("👉 Liên hệ ngay để nhận thông tin chi tiết & bảng giá!");

  // Hashtags from concrete facts only.
  const tags = [project.developer && tag(project.developer), project.district && tag(`BĐS${project.district}`)]
    .filter(Boolean)
    .join(" ");
  if (tags) lines.push(tags);

  return {
    format: "facebook_post",
    body: lines.join("\n"),
    usedFacts: used,
    missingSlots: missing,
  };
}

// One-line caption for quick reuse.
export function generateShortCaption(input: ContentInput): GeneratedContent {
  const { project } = input;
  const used: string[] = [];
  const missing: string[] = [];
  if (!project.name) missing.push("name");

  const parts: string[] = [];
  if (project.name) {
    parts.push(project.name);
    used.push(`Tên: ${project.name}`);
  }
  if (project.district) {
    parts.push(project.district);
    used.push(`Khu vực: ${project.district}`);
  }
  if (project.pricePerSqmM > 0) {
    parts.push(`từ ${project.pricePerSqmM} tr/m²`);
    used.push(`Giá: ${project.pricePerSqmM} tr/m²`);
  }

  const body = parts.length > 0 ? `${parts.join(" · ")} — liên hệ ngay!` : "";
  return { format: "short_caption", body, usedFacts: used, missingSlots: missing };
}

export function generateContent(format: ContentFormat, input: ContentInput): GeneratedContent {
  return format === "short_caption" ? generateShortCaption(input) : generateFacebookPost(input);
}
