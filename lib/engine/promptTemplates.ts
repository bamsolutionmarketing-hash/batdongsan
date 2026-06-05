import type { ComposeMode, ComposeTone } from "@/types/domain";

// Bump when wording changes — logged to generated_posts.prompt_version.
export const PROMPT_VERSION = "v0";

// ③ formula per mode
export const MODE_FORMULA: Record<ComposeMode, string> = {
  fb_post: "Hook → 2–3 ý chính → chứng cứ → CTA.",
  fb_analysis: "Luận điểm → phân tích số liệu → so sánh → kết luận.",
  short_caption: "1 hook + 1 câu chốt.",
  zalo_message: "Chào → 1 lý do liên hệ ngay → lời mời xem.",
};

// ⑥ output format per mode
export const MODE_FORMAT: Record<ComposeMode, string> = {
  fb_post: "4–6 đoạn ngắn, 3–6 emoji, 3–5 hashtag, thông tin liên hệ ở cuối.",
  fb_analysis: "Giọng phân tích, tối đa 2 emoji, có bullet số liệu, không hashtag rườm rà.",
  short_caption: "Tối đa 60 từ, 1–2 emoji, 1 dòng liên hệ.",
  zalo_message: "Tin nhắn 1:1, xưng 'em', kèm SĐT/Zalo, không hashtag.",
};

// ④ voice per tone
export const TONE_GUIDE: Record<ComposeTone, string> = {
  chuyen_gia: "Điềm tĩnh, dựa số liệu, khẳng định; không hô hào; xưng 'anh/chị'.",
  than_thien: "Gần gũi, ấm áp, vài emoji; như nhắn cho người quen.",
  ke_chuyen: "Mở bằng một quan sát/khung cảnh ngắn rồi dẫn vào dự án.",
};

// ⑤ absolute rules (invariant across mode/tone)
export const RULES = [
  "QUY TẮC BẮT BUỘC:",
  "- Giữ NGUYÊN 100% con số, mốc thời gian, tên riêng trong khối ① và bài gốc.",
  "- KHÔNG thêm bất kỳ số liệu/cam kết nào không có trong khối ①.",
  "- KHÔNG hứa lợi nhuận, KHÔNG cam kết tăng giá.",
  "- KHÔNG bịa tiện ích/pháp lý/tiến độ.",
  "- Giữ nguyên thông tin liên hệ ở cuối bài.",
  "- Trước khi xuất: tự rà, xóa câu nào chứa số/cam kết không có trong khối ①.",
].join("\n");
