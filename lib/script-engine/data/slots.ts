import type { SlotDef } from "../types";

// SLOT REGISTRY (Spec 2.3) — the data contract between templates and the DB.
// Only DATA slots live here (project / market / agent / audience / format).
// "Content" slots inside body templates (y_chinh, dien_giai, tac_dong, …) are
// NOT registered: the renderer fills any unknown {{slot}} with a readable,
// editable placeholder so a script is never blocked on author prose (P9).
//
// requiresSource=true (market group) means the node is dropped unless a real
// {{nguon}} resolves (R5) — fallbackText is intentionally absent there.

function def(d: SlotDef): SlotDef {
  return d;
}

export const SLOT_REGISTRY: Record<string, SlotDef> = {
  // ── 2.3.1 PROJECT (project columns + project_script_facts) ───────────────
  du_an: def({ key: "du_an", group: "project", dataType: "text", sourcePath: "project.name" }),
  cdt: def({ key: "cdt", group: "project", dataType: "text", sourcePath: "developer.name", fallbackText: "chủ đầu tư" }),
  khu_vuc: def({ key: "khu_vuc", group: "project", dataType: "text", sourcePath: "project.locationText", fallbackText: "khu vực này" }),
  khu_vuc_b: def({ key: "khu_vuc_b", group: "project", dataType: "text", fallbackText: "khu vực khác" }),
  du_an_b: def({ key: "du_an_b", group: "project", dataType: "text", fallbackText: "một dự án khác" }),
  loai_hinh: def({ key: "loai_hinh", group: "project", dataType: "enum", fallbackText: "bất động sản" }),
  loai_can: def({ key: "loai_can", group: "project", dataType: "text", computed: "bedrooms + wc + area", fallbackText: "căn này" }),
  gia_tu: def({ key: "gia_tu", group: "project", dataType: "currency", sourcePath: "project.priceMin", formatter: "fmt_ty", fallbackText: "tầm giá này" }),
  gia_max: def({ key: "gia_max", group: "project", dataType: "currency", sourcePath: "project.priceMax", formatter: "fmt_ty" }),
  gia_m2: def({ key: "gia_m2", group: "project", dataType: "currency", computed: "price/area", formatter: "fmt_trieu" }),
  dien_tich: def({ key: "dien_tich", group: "project", dataType: "number", formatter: "fmt_m2" }),
  view: def({ key: "view", group: "project", dataType: "text", fallbackText: "view đẹp" }),
  so_tang: def({ key: "so_tang", group: "project", dataType: "number" }),
  ban_giao: def({ key: "ban_giao", group: "project", dataType: "date", formatter: "fmt_quy" }),
  phap_ly: def({ key: "phap_ly", group: "project", dataType: "enum" }),
  usp_1: def({ key: "usp_1", group: "project", dataType: "text" }),
  usp_2: def({ key: "usp_2", group: "project", dataType: "text" }),
  usp_3: def({ key: "usp_3", group: "project", dataType: "text" }),
  tien_ich_hot: def({ key: "tien_ich_hot", group: "project", dataType: "text" }),
  chinh_sach: def({ key: "chinh_sach", group: "project", dataType: "text" }),
  chiet_khau: def({ key: "chiet_khau", group: "project", dataType: "text" }),
  so_can_con_lai: def({ key: "so_can_con_lai", group: "project", dataType: "number" }),
  tien_do: def({ key: "tien_do", group: "project", dataType: "text" }),

  // ── 2.3.2 MARKET (market_facts — requiresSource, no fallback) ─────────────
  lai_suat: def({ key: "lai_suat", group: "market", dataType: "number", formatter: "fmt_pct", requiresSource: true }),
  ty_le_tang_gia: def({ key: "ty_le_tang_gia", group: "market", dataType: "number", formatter: "fmt_pct", requiresSource: true }),
  khoang_tg: def({ key: "khoang_tg", group: "market", dataType: "text", fallbackText: "thời gian gần đây" }),
  so_lieu: def({ key: "so_lieu", group: "market", dataType: "text", requiresSource: true }),
  nguon: def({ key: "nguon", group: "market", dataType: "text", requiresSource: true }),
  moc_so_sanh: def({ key: "moc_so_sanh", group: "market", dataType: "text", requiresSource: true }),
  su_kien: def({ key: "su_kien", group: "market", dataType: "text", requiresSource: true }),

  // ── 2.3.3 AGENT (agent_branding) ─────────────────────────────────────────
  ten_sale: def({ key: "ten_sale", group: "agent", dataType: "text", sourcePath: "branding.displayName", fallbackText: "tôi" }),
  so_nam_kn: def({ key: "so_nam_kn", group: "agent", dataType: "number", sourcePath: "branding.soNamKn" }),
  so_giao_dich: def({ key: "so_giao_dich", group: "agent", dataType: "number", sourcePath: "branding.soGiaoDich" }),
  khu_vuc_chuyen: def({ key: "khu_vuc_chuyen", group: "agent", dataType: "text", sourcePath: "branding.khuVucChuyen", fallbackText: "bất động sản khu vực này" }),
  kenh_dat: def({ key: "kenh_dat", group: "agent", dataType: "text", sourcePath: "branding.kenhDat", fallbackText: "link ở bio" }),

  // ── 2.3.4 AUDIENCE & ENGAGEMENT (campaign config; mostly user-filled) ────
  chan_dung_kh: def({ key: "chan_dung_kh", group: "audience", dataType: "text", fallbackText: "người mua nhà" }),
  noi_dau: def({ key: "noi_dau", group: "audience", dataType: "text", fallbackText: "đang phân vân chọn nhà" }),
  ngan_sach: def({ key: "ngan_sach", group: "audience", dataType: "currency", formatter: "fmt_ty" }),
  thu_nhap: def({ key: "thu_nhap", group: "audience", dataType: "currency", formatter: "fmt_trieu" }),
  tu_khoa_cmt: def({ key: "tu_khoa_cmt", group: "audience", dataType: "keyword", fallbackText: "GIÁ" }),
  qua_tang: def({ key: "qua_tang", group: "audience", dataType: "text", fallbackText: "bảng giá mới nhất" }),
  tai_lieu: def({ key: "tai_lieu", group: "audience", dataType: "text", fallbackText: "tài liệu hữu ích" }),
  cau_hoi_kh: def({ key: "cau_hoi_kh", group: "audience", dataType: "text", fallbackText: "câu hỏi thường gặp" }),
  chu_de: def({ key: "chu_de", group: "audience", dataType: "text", fallbackText: "chủ đề này" }),

  // ── extra data slots referenced by hooks/nodes ───────────────────────────
  so_ngay: def({ key: "so_ngay", group: "format", dataType: "number", fallbackText: "vài" }),
  so_tien: def({ key: "so_tien", group: "project", dataType: "currency", formatter: "fmt_trieu", fallbackText: "khoản này" }),
  moc_tg: def({ key: "moc_tg", group: "project", dataType: "text", fallbackText: "thời điểm này" }),
  so_slot: def({ key: "so_slot", group: "format", dataType: "number", fallbackText: "vài" }),

  // ── 2.3.5 FORMAT (engine-generated; always resolve) ──────────────────────
  so_luong: def({ key: "so_luong", group: "format", dataType: "number" }),
  nam: def({ key: "nam", group: "format", dataType: "date" }),
  thang: def({ key: "thang", group: "format", dataType: "date" }),
  ngay: def({ key: "ngay", group: "format", dataType: "date" }),
  thoi_luong: def({ key: "thoi_luong", group: "format", dataType: "number" }),
  n: def({ key: "n", group: "format", dataType: "number" }),
  tu_khoa_seo: def({ key: "tu_khoa_seo", group: "format", dataType: "text" }),
};

// Format slots the engine always provides → never gate node selection.
export const ALWAYS_AVAILABLE = new Set([
  "nam", "thang", "ngay", "thoi_luong", "n", "so_luong",
]);

export function slotDef(key: string): SlotDef | undefined {
  return SLOT_REGISTRY[key];
}

// Smooth Vietnamese defaults for the content slots used by PAYOFF/CTX/PROOF
// templates, so an unfilled slot reads naturally instead of leaking a bracketed
// placeholder like "「cai duoc hua」".
const CONTENT_FALLBACK: Record<string, string> = {
  cai_duoc_hua: "điều bạn đang tìm",
  dap_an: "câu trả lời ngay sau đây",
  lua_chon: "phương án phù hợp nhất",
  lua_chon_tot_nhat: "lựa chọn đáng cân nhắc",
  ly_do_1cau: "lý do rất rõ ràng",
  twist: "điều ít người để ý",
  trang_thai_truoc: "lúc ban đầu",
  trang_thai_sau: "kết quả sau đó",
  y_chinh: "ý chính",
  dien_giai: "phần giải thích",
  tac_dong: "tác động thực tế",
  // ── CTX ─────────────────────────────────────────────────────────────────
  hau_qua: "không hề nhỏ",
  loi_hua: "điều quan trọng nhất",
  nhu_cau: "một lựa chọn rõ ràng",
  boi_canh_ngan: "thị trường đang nhiều biến động",
  tinh_huong_ngan: "gặp đúng tình huống này",
  // ── BODY_POINT (đứng đầu câu) ─────────────────────────────────────────────
  vi_sao_quan_trong: "Đây là điều tạo nên khác biệt",
  // ── BODY_DATA ─────────────────────────────────────────────────────────────
  con_so: "Con số đáng chú ý",
  chu_the: "mặt bằng giá",
  xu_huong: "thay đổi",
  ty_le: "một mức đáng kể",
  phep_tinh_ngan: "tính nhanh vài bước",
  ket_qua: "kết quả rõ rệt",
  // ── BODY_STORY ────────────────────────────────────────────────────────────
  chan_dung_ngan: "một người mua ở thực",
  tro_ngai: "rất phân vân",
  hanh_dong: "cùng rà lại thật kỹ",
  su_kien_1: "một cột mốc đáng nhớ",
  su_kien_2: "một thay đổi rõ rệt",
  bai_hoc: "một quyết định đúng lúc",
  y_kien_so_dong: "hãy chờ thêm đã",
  // ── BODY_DEMO ─────────────────────────────────────────────────────────────
  khu_vuc_can: "không gian này",
  diem_nhan: "chi tiết nổi bật",
  chi_tiet_cam_quan: "Tận mắt mới thấy rõ",
  kich_thuoc: "diện tích thoáng",
  huong: "hướng đẹp",
  diem_check: "những chi tiết hoàn thiện",
  vi_tri: "vị trí này",
  vat_lieu_hoan_thien: "vật liệu hoàn thiện",
  danh_gia_ngan: "rất đáng tiền",
  // ── BODY_COMPARE ──────────────────────────────────────────────────────────
  tieu_chi: "quan trọng",
  ben_a: "phương án A",
  ben_b: "phương án B",
  diem_a: "lợi thế riêng",
  diem_b: "ưu điểm khác",
  thu_de_thay: "thứ nhìn thấy ngay",
  thu_quyet_dinh: "yếu tố quyết định",
  uu_tien_1: "an toàn dòng tiền",
  uu_tien_2: "tiềm năng dài hạn",
  // ── BODY_OBJECTION ────────────────────────────────────────────────────────
  ngo_nhan: "chuyện này khó xảy ra",
  su_that: "ngược lại hoàn toàn",
  phan_doi_thuong_gap: "Giá vậy là cao quá",
  nhuoc_diem_thua_nhan: "vẫn có điểm chưa ưng",
  loi_ich_bu_dap: "phần giá trị lớn hơn",
  rui_ro_tuong_tuong: "điều ai cũng lo",
  rui_ro_that: "điều ít người để ý",
  // ── PROOF ─────────────────────────────────────────────────────────────────
  ket_qua_khach: "đã chốt được căn ưng ý",
  so_du_an_ban_giao: "nhiều",
  // ── CTA ───────────────────────────────────────────────────────────────────
  phan_tiep: "sau",
  noi_dung_phan_sau: "điều thú vị tiếp theo",
  lua_chon_a: "phương án A",
  lua_chon_b: "phương án B",
};

export function contentFallback(key: string): string | undefined {
  return CONTENT_FALLBACK[key];
}

// Human-readable placeholder for an unregistered content slot. Prefers a smooth
// default; else a readable phrase (no leaked raw {{tokens}}).
export function humanizeSlot(key: string): string {
  return CONTENT_FALLBACK[key] ?? key.replace(/_/g, " ");
}
