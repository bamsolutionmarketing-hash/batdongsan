import type { ComposeTone } from "@/types/domain";

// Bump when wording changes — logged to generated_posts.prompt_version (video).
export const VIDEO_PROMPT_VERSION = "vid-v1";

export type VideoFormat = "reel" | "tiktok" | "short";
export type VideoLength = 15 | 30 | 60;

// Role/wrapper header — turns the body into a self-contained brief for a fresh
// AI chat (ChatGPT/Claude/Gemini) to write a ready-to-shoot short-video SCRIPT.
export const VIDEO_ROLE_HEADER = [
  "Bạn là biên kịch video ngắn bất động sản tại Việt Nam, viết KỊCH BẢN để môi giới tự quay/dựng.",
  "Nhiệm vụ: từ dữ liệu bên dưới, viết kịch bản video ngắn theo định dạng & độ dài yêu cầu.",
  "RÀNG BUỘC CỐT LÕI: chỉ được dùng dữ kiện trong khối ①. Không có trong khối ① thì KHÔNG được nói ra.",
].join("\n");

// ③ platform format — concrete shooting/editing constraints per channel.
export const FORMAT_GUIDE: Record<VideoFormat, string> = {
  reel: "Instagram/Facebook Reels — khung dọc 9:16. Hook 3 giây đầu phải chặn người lướt. Phụ đề chữ to vì đa số xem KHÔNG bật tiếng.",
  tiktok: "TikTok — dọc 9:16, nhịp nhanh, khẩu ngữ tự nhiên. Hook gây tò mò ngay câu đầu; ưu tiên text on-screen lớn, cắt cảnh dồn dập.",
  short: "YouTube Shorts — dọc 9:16, ≤60 giây. Mở bằng câu hỏi/khẳng định mạnh; nhịp vừa, có thể lồng tiếng rõ ràng hơn.",
};

// ④ voice per tone (shared wording with the post engine's tone guide).
export const VIDEO_TONE_GUIDE: Record<ComposeTone, string> = {
  chuyen_gia: "Điềm tĩnh, dựa số liệu, khẳng định chắc chắn; xưng 'anh/chị'. Hợp video phân tích/đầu tư.",
  than_thien: "Gần gũi, hào hứng, như đang dẫn khách đi xem thực tế; xưng 'em'.",
  ke_chuyen: "Mở bằng một quan sát/khung cảnh rồi dẫn vào dự án — hợp video cảm xúc.",
};

// Per-length plan: number of point-scenes + pacing. Drives ③.
export function lengthPlan(length: VideoLength): string {
  const plan: Record<VideoLength, string> = {
    15: "Tổng ~15 giây: HOOK (0–3s) → 2 cảnh điểm nhấn (mỗi cảnh ~5s, mỗi cảnh 1 ý mạnh nhất) → CTA (~2s). Chọn 2 điểm đắt giá nhất.",
    30: "Tổng ~30 giây: HOOK (0–3s) → 3–4 cảnh (mỗi cảnh ~6s, mỗi cảnh 1 điểm) → CTA (~3s).",
    60: "Tổng ~60 giây: HOOK (0–3s) → 5–6 cảnh (mỗi cảnh ~8s) → 1 cảnh chốt giá trị/đầu tư → CTA (~4s).",
  };
  return plan[length];
}

// ⑤ compliance rules (same spine as the post engine + video specifics).
export const VIDEO_RULES = [
  "QUY TẮC BẮT BUỘC:",
  "- Giữ NGUYÊN 100% con số, mốc thời gian, tên riêng trong khối ①. KHÔNG thêm số liệu/giá/tiện ích/pháp lý ngoài khối ①.",
  "- KHÔNG hứa lợi nhuận, KHÔNG cam kết tăng giá, KHÔNG dùng 'chắc chắn lời'/'cam kết sinh lời'.",
  "- Dữ liệu nào là giá đồn/tham khảo/chưa công bố thì lời thoại phải nói rõ 'giá tham khảo, chưa chính thức'.",
  "- Hook gây chú ý nhưng KHÔNG giật tít sai sự thật.",
  "- Giữ nguyên thông tin liên hệ ở cảnh CTA.",
].join("\n");

// ⑥ output contract — a concrete, paste-ready storyboard, no AI preamble.
export const VIDEO_OUTPUT_CONTRACT = [
  "ĐẦU RA (chỉ in kịch bản, KHÔNG lời dẫn/giải thích, KHÔNG bọc markdown ```):",
  "A. 3 PHƯƠNG ÁN HOOK — mỗi hook ≤ 12 từ, là chữ hiện 3 giây đầu.",
  "B. STORYBOARD theo cảnh, mỗi cảnh đúng 1 dòng dạng:",
  "   [giây] | [hình ảnh/cảnh quay gợi ý] | [chữ trên màn hình] | [lời thoại/voiceover]",
  "C. CTA cuối — kèm tên + SĐT/Zalo (giữ nguyên).",
  "D. CAPTION đăng kèm (≤ 2 dòng) + 5–10 hashtag tiếng Việt.",
  "E. GỢI Ý NHẠC/NHỊP dựng (1 dòng).",
  "TỰ KIỂM trước khi xuất: xóa mọi câu chứa số/cam kết/tiện ích không có trong khối ①.",
].join("\n");
