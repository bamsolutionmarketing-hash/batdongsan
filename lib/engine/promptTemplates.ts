import type { ComposeMode, ComposeTone } from "@/types/domain";

// Bump when wording changes — logged to generated_posts.prompt_version.
export const PROMPT_VERSION = "v2";

// Role/wrapper header — turns the body into a self-contained brief so the agent
// can paste it into ANY fresh AI chat (ChatGPT/Gemini/Grok) and get a usable
// post on the first try, with no prior context. v2: the mission is "write a NEW
// seamless post from raw material", not "lightly edit the draft" — the draft is
// machine-stitched blocks, so preserving its structure preserves its choppiness.
export const ROLE_HEADER = [
  "Bạn là chuyên gia copywriting bất động sản tại Việt Nam, viết bài đăng bán dự án cho môi giới.",
  "Nhiệm vụ: từ NGUYÊN LIỆU bên dưới, viết MỘT bài đăng hoàn chỉnh, liền mạch, tự nhiên như người thật viết — KHÔNG phải chỉnh sửa nhẹ bài nháp.",
  "RÀNG BUỘC CỐT LÕI: chỉ được dùng dữ kiện trong khối ①. Không có gì trong khối ① thì KHÔNG được viết ra.",
].join("\n");

// ③ formula per mode — the skeleton the rewrite must follow.
export const MODE_FORMULA: Record<ComposeMode, string> = {
  fb_post: "1–2 dòng đầu là hook chạm đúng nỗi băn khoăn/mong muốn của người mua → 2–3 ý chính (mỗi ý 1 đoạn, có câu chuyển tự nhiên) → 1 chứng cứ/số liệu đắt giá nhất → CTA rõ ràng.",
  fb_analysis: "Luận điểm mở → phân tích số liệu khối ① → so sánh/đối chiếu → kết luận đầu tư.",
  short_caption: "1 hook gây chú ý + 1 câu chốt giá trị. Không lan man.",
  zalo_message: "Chào ngắn → 1 lý do nên liên hệ NGAY → lời mời xem/nhận thông tin.",
};

// ⑦ output format per mode — concrete, checkable constraints.
export const MODE_FORMAT: Record<ComposeMode, string> = {
  fb_post: "4–6 đoạn ngắn (mỗi đoạn 1–3 câu), 3–6 emoji đặt hợp ngữ cảnh, 3–5 hashtag cuối bài, dòng liên hệ ở cuối.",
  fb_analysis: "Giọng phân tích, tối đa 2 emoji, có ít nhất 1 cụm bullet số liệu, không hashtag rườm rà.",
  short_caption: "Tối đa 60 từ, 1–2 emoji, kết bằng 1 dòng liên hệ.",
  zalo_message: "Tin nhắn 1:1 xưng 'em', tối đa ~80 từ, kèm SĐT/Zalo, KHÔNG hashtag, KHÔNG emoji quá 2.",
};

// ④ voice per tone.
export const TONE_GUIDE: Record<ComposeTone, string> = {
  chuyen_gia: "Điềm tĩnh, dựa số liệu, khẳng định chắc chắn; không hô hào; xưng 'anh/chị'.",
  than_thien: "Gần gũi, ấm áp, vài emoji; viết như đang nhắn cho người quen.",
  ke_chuyen: "Mở bằng một quan sát/khung cảnh ngắn rồi dẫn tự nhiên vào dự án.",
};

// ⑤ absolute rules (invariant across mode/tone). These are the compliance spine.
// v2 resolves the old tension: FACTS are frozen, WORDING is free — without this
// the model edits timidly and the stitched-block seams survive the rewrite.
export const RULES = [
  "QUY TẮC BẮT BUỘC:",
  "- Giữ NGUYÊN 100% con số, mốc thời gian, tên riêng trong khối ① — nhưng LỜI VĂN thì viết lại tự do, không cần giữ câu chữ của nguyên liệu.",
  "- KHÔNG thêm bất kỳ số liệu/diện tích/giá/tiện ích/pháp lý nào không có trong khối ①.",
  "- KHÔNG hứa lợi nhuận, KHÔNG cam kết tăng giá, KHÔNG dùng 'chắc chắn lời', 'cam kết sinh lời'.",
  "- KHÔNG bịa tiến độ, chính sách, hay so sánh với dự án khác nếu khối ① không có.",
  "- Giữ nguyên thông tin liên hệ ở cuối bài.",
].join("\n");

// ⑥ the polish bar — what "mượt" concretely means. This is the v2 quality gate:
// it names the exact failure modes of a machine-stitched draft (duplicated
// ideas, no through-line, listy numbers, stock phrases) so the model fixes them
// instead of preserving them.
export const QUALITY_GUIDE = [
  "TIÊU CHUẨN BÀI MƯỢT (bắt buộc đạt đủ):",
  "- Nguyên liệu là các khối máy ghép — CÓ THỂ trùng ý, rời rạc. Viết lại thành bài MỚI: gộp ý trùng (mỗi ý chỉ xuất hiện 1 lần), bỏ câu thừa, KHÔNG giữ nguyên cấu trúc từng đoạn.",
  "- Cả bài bám MỘT thông điệp chính (ưu tiên 'góc kể' của điểm đầu tiên trong khối ①); mọi đoạn phải phục vụ thông điệp đó.",
  "- 1–2 dòng đầu phải tự đứng được và khiến người lướt dừng lại (Facebook thu gọn phần sau 'Xem thêm').",
  "- Mỗi đoạn đúng 1 ý, nối nhau bằng câu chuyển tự nhiên; câu dài ngắn xen kẽ, không đều đều.",
  "- Đan số liệu vào câu văn (vd: 'chỉ ~10 phút tới Q1') thay vì liệt kê khô từng dòng.",
  "- Tên dự án xuất hiện tối đa 3 lần; tránh từ sáo rỗng: 'đẳng cấp', 'tuyệt vời', 'cơ hội vàng', 'siêu phẩm'… trừ khi có trong khối ①.",
  "- Đọc lại lần cuối: câu nào trúc trắc hoặc nghe như máy viết — viết lại cho giống người thật đăng.",
].join("\n");

// ⑦ output contract — forces a clean, paste-ready result (no AI preamble/notes).
export const OUTPUT_CONTRACT = [
  "- CHỈ in ra nội dung bài đăng hoàn chỉnh. KHÔNG thêm lời dẫn, giải thích, tiêu đề 'Bài đăng:', hay ghi chú.",
  "- KHÔNG bọc trong dấu ``` hay markdown thừa.",
  "- TỰ KIỂM trước khi xuất: (1) rà từng câu, xóa ngay câu nào chứa số/cam kết/tiện ích không có trong khối ①; (2) còn ý lặp lại không? (3) hai dòng đầu đã đủ khiến người lướt dừng chưa?",
].join("\n");
