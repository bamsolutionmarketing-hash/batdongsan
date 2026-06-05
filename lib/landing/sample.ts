import type { GraphData } from "@/lib/data/types";

// ── Caption demo: build a compliance-safe sample caption from parts, varying by
// tone (hook/voice) and mode (format). All numbers are verified Gladia facts.
export const DEMO_MODES = [
  { v: "fb_post", label: "FB Post" },
  { v: "short_caption", label: "Caption ngắn" },
  { v: "zalo_message", label: "Zalo" },
] as const;
export const DEMO_TONES = [
  { v: "chuyen_gia", label: "Chuyên gia" },
  { v: "than_thien", label: "Thân thiện" },
  { v: "ke_chuyen", label: "Kể chuyện" },
] as const;

export type DemoMode = (typeof DEMO_MODES)[number]["v"];
export type DemoTone = (typeof DEMO_TONES)[number]["v"];

const HOOK: Record<DemoTone, string> = {
  chuyen_gia: "Vành đai 3 thông toàn tuyến 30/6/2026 — khu Đông bước vào chu kỳ hạ tầng mới.",
  than_thien: "Khu Đông đang “thay áo” từng ngày, và Gladia đứng ngay tâm điểm 👀",
  ke_chuyen: "Năm 2015 ai cũng chê khu Đông xa. Mười năm sau, hạ tầng đã trả lời.",
};
const PROOF = "Liên doanh Keppel × Khang Điền trên 11.8 ha, đạt chứng nhận Green Mark — pháp lý minh bạch, tiến độ bảo chứng.";
const CTA: Record<DemoMode, string> = {
  fb_post: "👉 Nhắn An BĐS – 0900 123 456 để nhận mặt bằng & chính sách mới nhất.",
  short_caption: "Liên hệ An BĐS – 0900 123 456.",
  zalo_message: "Em gửi anh/chị bảng giá ngay nhé? — An BĐS, 0900 123 456.",
};

export function sampleCaption(mode: DemoMode, tone: DemoTone): string {
  const hook = HOOK[tone];
  if (mode === "short_caption") return `${hook}\n\n${CTA.short_caption}`;
  if (mode === "zalo_message") return `Chào anh/chị! ${hook}\n\n${CTA.zalo_message}`;
  return `${hook}\n\n${PROOF}\n\n${CTA.fb_post}\n\n#Gladia #KhuĐông #BĐS`;
}

// ── Graph teaser: a small Gladia-flavoured knowledge graph.
const N = (id: string, label: string, group: string, degree: number): GraphData["nodes"][number] => ({
  id, label, group, degree, val: 3 + degree * 1.4,
});
export const SAMPLE_GRAPH: GraphData = {
  nodes: [
    N("gladia", "Gladia", "project", 5),
    N("keppel", "Keppel Land", "developer", 2),
    N("vanhdai3", "Vành đai 3", "road", 2),
    N("longthanh", "Sân bay Long Thành", "amenity", 1),
    N("metro6", "Metro số 6", "metro", 1),
    N("greenmark", "Green Mark", "cert", 1),
    N("thanhmyloi", "Thạnh Mỹ Lợi", "location", 1),
  ],
  links: [
    { source: "gladia", target: "keppel", group: "related" },
    { source: "gladia", target: "vanhdai3", group: "related" },
    { source: "gladia", target: "greenmark", group: "related" },
    { source: "gladia", target: "metro6", group: "related" },
    { source: "gladia", target: "thanhmyloi", group: "related" },
    { source: "vanhdai3", target: "longthanh", group: "related" },
    { source: "keppel", target: "greenmark", group: "related" },
  ],
};
