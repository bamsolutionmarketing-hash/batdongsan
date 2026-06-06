import type { ComposeTone } from "@/types/domain";

// Bump when wording changes — logged to generated_posts.prompt_version (video).
export const VIDEO_PROMPT_VERSION = "vid-v2";

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

// ── Script templates (kịch bản) — extensible registry ───────────────────────
// Each template only swaps the narrative ARC in block ③; everything else
// (verified-data spine, rules, output contract) stays identical. Add entries
// freely — no engine change needed.
export interface VideoScriptTemplate {
  id: string;
  label: string;
  desc: string; // when to use (shown in the picker)
  arc: string; // scene-by-scene structure injected into ③
  hook: string; // hook-style hint for this template
}

export const SCRIPT_TEMPLATES: VideoScriptTemplate[] = [
  {
    id: "tong_quan",
    label: "Tổng quan dự án",
    desc: "Giới thiệu nhanh toàn cảnh — hợp khi đăng lần đầu / chạy nhận diện.",
    arc: "HOOK định vị 1 câu → 3–4 cảnh, mỗi cảnh 1 điểm mạnh nhất (vị trí → quy mô/thiết kế → tiện ích/hạ tầng → pháp lý/giá) → cảnh chốt giá trị → CTA.",
    hook: "Định vị khác biệt nhất của dự án gói trong 1 câu.",
  },
  {
    id: "review_nha_mau",
    label: "Tour / review nhà mẫu",
    desc: "Đi xem thực tế từng không gian — hợp căn hộ/nhà mẫu có hình hoặc thực địa.",
    arc: "HOOK 'bước vào căn [loại]' → đi lần lượt: lối vào → phòng khách → bếp → phòng ngủ → ban công & view → 1 cảnh cảm nhận tổng → CTA mời xem nhà mẫu. Mỗi cảnh tả 1 không gian + 1 chi tiết đắt.",
    hook: "Mời người xem 'bước vào', tạo cảm giác không gian ngay giây đầu.",
  },
  {
    id: "so_sanh",
    label: "So sánh 2 lựa chọn",
    desc: "So sánh 2 phân khu/dự án — nên chọn ≥2 điểm cùng loại.",
    arc: "HOOK đặt câu hỏi 'A hay B?' → 3 tiêu chí, mỗi tiêu chí 1 cảnh (vị trí → giá/chính sách → pháp lý/tiến độ), nói thẳng bên nào hơn ở từng tiêu chí → cảnh 'hợp với ai' → CTA tư vấn chọn.",
    hook: "Đặt đúng thế phân vân người mua đang gặp.",
  },
  {
    id: "ly_do",
    label: "N lý do (listicle)",
    desc: "Dạng đếm số dễ lan truyền — hợp 2–4 điểm nổi bật.",
    arc: "HOOK 'X lý do [nên cân nhắc] [dự án]' → mỗi lý do 1 cảnh, ĐÁNH SỐ rõ (1, 2, 3…) → cảnh chốt → CTA. Số lý do = số điểm được chọn.",
    hook: "Nêu con số + lời hứa giá trị cụ thể.",
  },
  {
    id: "pha_tin_don",
    label: "Phá tin đồn / Sự thật",
    desc: "Cố vấn trung thực — hợp dự án nhiều tin đồn / giá rumor.",
    arc: "HOOK 'Đừng vội tin lời đồn về [dự án]' → mỗi cảnh nêu 1 hiểu lầm rồi đối chiếu SỰ THẬT từ khối ① → cảnh 'nguyên tắc an toàn khi xuống tiền' → CTA tư vấn. Tuyệt đối không khẳng định điều khối ① không có.",
    hook: "Chạm nỗi sợ bị dẫn dắt: tin này đúng hay sai?",
  },
  {
    id: "tin_nong",
    label: "Tin nóng hạ tầng / sự kiện",
    desc: "Bắt trend hạ tầng/sự kiện — hợp node hạ tầng hoặc sự kiện.",
    arc: "HOOK 'Vừa có tin…' → cảnh nêu mốc hạ tầng/sự kiện cụ thể → cảnh 'tác động tới [khu/dự án]' → cảnh 'ai nên để ý' → CTA. Chỉ dùng mốc có trong khối ①.",
    hook: "Tạo cảm giác cập nhật nóng (vừa thông xe / vừa khởi công…).",
  },
  {
    id: "cau_chuyen",
    label: "Kể chuyện / cảm xúc",
    desc: "Chạm cảm xúc người mua ở thực — nhẹ nhàng, ít số liệu.",
    arc: "HOOK một khung cảnh đời sống → 2–3 cảnh khắc hoạ trải nghiệm sống → cảnh chốt 'giá trị thật của ngôi nhà' → CTA nhẹ. Cảm xúc dẫn dắt, số liệu chỉ điểm xuyết.",
    hook: "Một quan sát đời thường gợi cảm xúc, chưa vội nói tên dự án.",
  },
  {
    id: "phan_tich_dau_tu",
    label: "Phân tích đầu tư",
    desc: "Cho nhà đầu tư — hợp node thị trường/đầu tư; cân bằng cơ hội & rủi ro.",
    arc: "HOOK 'Xuống tiền [dự án] lúc này có hợp lý?' → cảnh dữ kiện định giá/mặt bằng giá → cảnh động lực tăng giá (hạ tầng) → cảnh RỦI RO nói thẳng (yield/dòng tiền/tiến độ) → cảnh khuyến nghị CÓ ĐIỀU KIỆN → CTA tư vấn. Không hứa lợi nhuận.",
    hook: "Đặt câu hỏi đầu tư mà người xem đang cân nhắc.",
  },
  {
    id: "pov_song",
    label: "POV: một ngày sống",
    desc: "Trend POV trải nghiệm sống — hợp tiện ích & cộng đồng.",
    arc: "HOOK 'POV: sống ở [dự án]' → cảnh SÁNG (tiện ích/cảnh quan) → TRƯA/CHIỀU (kết nối/đi làm) → TỐI (cộng đồng/sự kiện) → CTA. Mỗi mốc 1 cảnh, on-screen ghi khung giờ.",
    hook: "Nhập vai trải nghiệm sống ngay câu đầu.",
  },
];

export const DEFAULT_TEMPLATE_ID = "tong_quan";

export function getScriptTemplate(id: string): VideoScriptTemplate {
  return SCRIPT_TEMPLATES.find((t) => t.id === id) ?? SCRIPT_TEMPLATES[0];
}
