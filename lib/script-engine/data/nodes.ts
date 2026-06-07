import type { NodeTemplate } from "../types";

// NODE BANK (Spec §5): CTX / BODY_* / PROOF / PAYOFF / CTA / LOOP.
//
// requiresSlots lists ONLY data slots whose absence should disqualify the node
// (so we never fabricate agent numbers, legal status, or sourced market data).
// "Content" slots (y_chinh, dien_giai, ket_qua, …) are deliberately NOT listed:
// the renderer fills them with editable placeholders so a body is never blocked
// on author prose. toneTags/platformFit omitted ⇒ tone-/platform-neutral.

export const NODE_BANK: NodeTemplate[] = [
  // ── 5.1 CTX — Bridge / Context (2–4s, 8–14 từ) ───────────────────────────
  { id: "CTX-01", type: "CTX", text: "Nếu bạn đang {{noi_dau}}, thì video này quay đúng cho bạn.", onscreen: "Dành cho bạn", visual: "Nhìn thẳng cam, hạ giọng đồng cảm", duration: [2, 4], words: [8, 14] },
  { id: "CTX-02", type: "CTX", text: "Tôi là {{ten_sale}}, {{so_nam_kn}} năm chuyên {{khu_vuc_chuyen}}, hơn {{so_giao_dich}} giao dịch.", onscreen: "{{so_nam_kn}} năm · {{so_giao_dich}} giao dịch", visual: "Cận mặt tự tin, có thể chèn ảnh thành tích", duration: [2, 4], words: [8, 14], requiresSlots: ["so_nam_kn", "so_giao_dich"] },
  { id: "CTX-03", type: "CTX", text: "Quyết sai ở đúng bước này, cái giá phải trả là {{hau_qua}}.", onscreen: "Cẩn thận bước này", visual: "Nhíu mày, nhịp chậm lại", duration: [2, 4], words: [8, 14] },
  { id: "CTX-04", type: "CTX", text: "Trong {{thoi_luong}} giây tới, bạn sẽ biết chính xác {{loi_hua}}.", onscreen: "{{thoi_luong}}s", visual: "Giơ ngón đếm ngược", duration: [2, 4], words: [8, 14] },
  { id: "CTX-05", type: "CTX", text: "Video này dành cho người có tầm {{ngan_sach}} và đang cần {{nhu_cau}}.", onscreen: "Tầm {{ngan_sach}}", visual: "Chỉ vào cam, lọc đối tượng", duration: [2, 4], words: [8, 14], requiresSlots: ["ngan_sach"] },
  { id: "CTX-06", type: "CTX", text: "Bối cảnh nhanh: {{boi_canh_ngan}}. Vì vậy chuyện này mới quan trọng.", onscreen: "Bối cảnh", visual: "B-roll thị trường/khu vực", duration: [2, 4], words: [8, 14] },
  { id: "CTX-07", type: "CTX", text: "Không vòng vo — vào thẳng vấn đề.", onscreen: "Vào thẳng", visual: "Cắt nhanh, nhịp dứt khoát", duration: [2, 3], words: [6, 10] },
  { id: "CTX-08", type: "CTX", text: "Tuần trước, một khách của tôi {{tinh_huong_ngan}}. Và đó là lý do có video này.", onscreen: "Chuyện tuần trước", visual: "Hồi tưởng, ánh mắt kể chuyện", duration: [2, 4], words: [8, 14] },

  // ── 5.2 BP — BODY_POINT (5–8s, 16–26 từ): connector + ý chính + vì sao ───
  { id: "BP-C1", type: "BODY_POINT", text: "Thứ {{n}}: {{y_chinh}}. {{vi_sao_quan_trong}}.", onscreen: "{{y_chinh}}", visual: "Đổi góc máy / B-roll minh hoạ đúng ý; overlay = từ khoá ≤5 từ", duration: [5, 8], words: [16, 26] },
  { id: "BP-C2", type: "BODY_POINT", text: "Điều ít ai nói với bạn: {{y_chinh}}. {{vi_sao_quan_trong}}.", onscreen: "{{y_chinh}}", visual: "Nghiêng người, hạ giọng tiết lộ; B-roll minh hoạ", duration: [5, 8], words: [16, 26] },
  { id: "BP-C3", type: "BODY_POINT", text: "Tiếp theo — và cái này quan trọng hơn: {{y_chinh}}. {{vi_sao_quan_trong}}.", onscreen: "{{y_chinh}}", visual: "Cắt cảnh mới, nhấn nhịp; B-roll minh hoạ", duration: [5, 8], words: [16, 26] },
  { id: "BP-C4", type: "BODY_POINT", text: "Đây mới là điểm ăn tiền: {{y_chinh}}. {{vi_sao_quan_trong}}.", onscreen: "{{y_chinh}}", visual: "Zoom nhẹ vào chi tiết; B-roll minh hoạ", duration: [5, 8], words: [16, 26] },
  { id: "BP-C5", type: "BODY_POINT", text: "Số {{n}}, nghe kỹ nè: {{y_chinh}}. {{vi_sao_quan_trong}}.", onscreen: "{{y_chinh}}", visual: "Chỉ tay vào overlay số; B-roll minh hoạ", duration: [5, 8], words: [16, 26] },

  // ── BD — BODY_DATA (5–8s): Số → Nghĩa → Tác động ─────────────────────────
  { id: "BD-01", type: "BODY_DATA", text: "{{con_so}}. Nghĩa là {{dien_giai}}. Với bạn, điều đó tức là {{tac_dong}}.", onscreen: "{{con_so}}", visual: "Con số hiện to giữa khung; nguồn chữ nhỏ góc phải", duration: [5, 8], words: [18, 28], requiresSlots: ["nguon"] },
  { id: "BD-02", type: "BODY_DATA", text: "So với {{moc_so_sanh}}, {{chu_the}} đang {{xu_huong}} khoảng {{ty_le}}.", onscreen: "{{ty_le}}", visual: "Biểu đồ 2 cột so sánh; nguồn góc dưới", duration: [5, 8], words: [16, 26], requiresSlots: ["moc_so_sanh", "nguon"] },
  { id: "BD-03", type: "BODY_DATA", text: "Quy hết ra tiền: {{phep_tinh_ngan}} — ra đúng {{ket_qua}}.", onscreen: "{{ket_qua}}", visual: "Viết phép tính lên màn hình / máy tính bấm", duration: [5, 8], words: [14, 22] },
  { id: "BD-04", type: "BODY_DATA", text: "Số liệu từ {{nguon}}: {{con_so}} — tôi để nguyên ảnh chụp trên màn hình cho bạn tự kiểm.", onscreen: "{{con_so}}", visual: "Chụp màn hình báo cáo gốc, khoanh số", duration: [5, 8], words: [16, 26], requiresSlots: ["nguon"] },

  // ── BS — BODY_STORY (7–10s): Bối cảnh → Trở ngại → Hành động → Kết quả ────
  { id: "BS-01", type: "BODY_STORY", text: "Khách tôi — {{chan_dung_ngan}} — từng {{tro_ngai}}. Bọn tôi {{hanh_dong}}. Kết quả: {{ket_qua}}.", onscreen: "Chuyện thật", visual: "Dựng lại cảnh / ảnh tư liệu che mặt khách", duration: [7, 10], words: [24, 34] },
  { id: "BS-02", type: "BODY_STORY", text: "Ngày {{moc_tg}}: {{su_kien_1}}. {{khoang_tg}} sau: {{su_kien_2}}. Khác biệt nằm ở {{bai_hoc}}.", onscreen: "Trước → Sau", visual: "Timeline 2 mốc, before/after", duration: [7, 10], words: [22, 32] },
  { id: "BS-03", type: "BODY_STORY", text: "Lúc đó ai cũng nói {{y_kien_so_dong}}. Khách tôi làm ngược lại — và {{ket_qua}}.", onscreen: "Làm ngược số đông", visual: "Cảnh đám đông vs cá nhân, tương phản", duration: [7, 10], words: [22, 32] },

  // ── BDM — BODY_DEMO / tour beat (5–8s) ───────────────────────────────────
  { id: "BDM-01", type: "BODY_DEMO", text: "Đây là {{khu_vuc_can}} — để ý {{diem_nhan}}. {{chi_tiet_cam_quan}}.", onscreen: "{{khu_vuc_can}}", visual: "Walk-in quay {{khu_vuc_can}}, pan tới điểm nhấn", duration: [5, 8], words: [16, 26] },
  { id: "BDM-02", type: "BODY_DEMO", text: "Bước vào {{khu_vuc_can}}: {{kich_thuoc}}, hướng {{huong}} — và chỗ bạn cần soi kỹ là {{diem_check}}.", onscreen: "{{huong}} · {{kich_thuoc}}", visual: "Bước vào không gian, lia toàn cảnh rồi cận điểm cần soi", duration: [5, 8], words: [18, 28] },
  { id: "BDM-03", type: "BODY_DEMO", text: "Chỗ này mọi người hay lướt qua — nhưng {{vi_tri}} mới quyết định trải nghiệm sống hằng ngày.", onscreen: "Đừng bỏ qua", visual: "Dừng lại ở chi tiết dễ bị bỏ qua, cận cảnh", duration: [5, 8], words: [16, 26] },
  { id: "BDM-04", type: "BODY_DEMO", text: "[Quay cận] {{vat_lieu_hoan_thien}} — loại này {{danh_gia_ngan}}.", onscreen: "{{vat_lieu_hoan_thien}}", visual: "Macro/cận vật liệu hoàn thiện, chạm tay vào", duration: [5, 8], words: [12, 20] },

  // ── BC — BODY_COMPARE (6–9s) ─────────────────────────────────────────────
  { id: "BC-01", type: "BODY_COMPARE", text: "Cùng tiêu chí {{tieu_chi}}: {{ben_a}} được {{diem_a}}, còn {{ben_b}} là {{diem_b}}.", onscreen: "{{ben_a}} vs {{ben_b}}", visual: "Split-screen hoặc bảng 2 cột overlay", duration: [6, 9], words: [18, 28] },
  { id: "BC-02", type: "BODY_COMPARE", text: "Khác biệt lớn nhất không phải {{thu_de_thay}} — mà là {{thu_quyet_dinh}}.", onscreen: "Khác biệt thật", visual: "Gạt yếu tố hiển nhiên sang bên, nhấn yếu tố quyết định", duration: [6, 9], words: [14, 24] },
  { id: "BC-03", type: "BODY_COMPARE", text: "Bạn ưu tiên {{uu_tien_1}} → chọn {{ben_a}}. Ưu tiên {{uu_tien_2}} → {{ben_b}}. Đơn giản vậy.", onscreen: "Chọn theo ưu tiên", visual: "Sơ đồ rẽ nhánh 2 hướng overlay", duration: [6, 9], words: [18, 28] },

  // ── BO — BODY_OBJECTION (5–8s) ───────────────────────────────────────────
  { id: "BO-01", type: "BODY_OBJECTION", text: "Nhiều người nghĩ {{ngo_nhan}}. Thực tế: {{su_that}}.", onscreen: "Ngộ nhận vs Sự thật", visual: "Text 'Ngộ nhận' gạch chéo → 'Sự thật'", duration: [5, 8], words: [12, 22] },
  { id: "BO-02", type: "BODY_OBJECTION", text: "'{{phan_doi_thuong_gap}}' — câu này tôi nghe mỗi tuần. Đây là góc nhìn khác:", onscreen: "Góc nhìn khác", visual: "Nhại lại lời phản đối rồi lật lại", duration: [5, 8], words: [14, 24] },
  { id: "BO-03", type: "BODY_OBJECTION", text: "Đúng là {{nhuoc_diem_thua_nhan}}. Nhưng đổi lại, bạn được {{loi_ich_bu_dap}}.", onscreen: "Đánh đổi", visual: "Cân 2 bên: nhược điểm ↔ lợi ích", duration: [5, 8], words: [14, 24] },
  { id: "BO-04", type: "BODY_OBJECTION", text: "Rủi ro lớn nhất không phải {{rui_ro_tuong_tuong}} — mà là {{rui_ro_that}}.", onscreen: "Rủi ro thật", visual: "Gạt rủi ro tưởng tượng, nhấn rủi ro thật", duration: [5, 8], words: [14, 24] },

  // ── 5.3 PRF — Proof (4–6s) ───────────────────────────────────────────────
  { id: "PRF-01", type: "PROOF", text: "{{so_giao_dich}} giao dịch ngay tại {{khu_vuc}} trong {{khoang_tg}} — không phải lý thuyết.", onscreen: "{{so_giao_dich}} giao dịch", visual: "Lướt ảnh ký kết/bàn giao đã che thông tin", duration: [4, 6], words: [12, 20], requiresSlots: ["so_giao_dich"] },
  { id: "PRF-02", type: "PROOF", text: "Khách gần nhất của tôi: {{ket_qua_khach}} — tin nhắn thật trên màn hình, tôi che tên.", onscreen: "Tin nhắn thật", visual: "Quay màn hình tin nhắn, che danh tính", duration: [4, 6], words: [12, 20] },
  { id: "PRF-03", type: "PROOF", text: "Pháp lý: {{phap_ly}} — giấy tờ tôi đang cầm trên tay đây.", onscreen: "{{phap_ly}}", visual: "Cầm giấy tờ pháp lý đưa lên cam", duration: [4, 6], words: [10, 18], requiresSlots: ["phap_ly"] },
  { id: "PRF-04", type: "PROOF", text: "{{cdt}} đã bàn giao {{so_du_an_ban_giao}} dự án đúng hạn — track record kiểm chứng được.", onscreen: "Track record CĐT", visual: "Ảnh các dự án đã bàn giao của CĐT", duration: [4, 6], words: [12, 20] },
  { id: "PRF-05", type: "PROOF", text: "Toàn bộ số liệu lấy từ {{nguon}} — không phải tôi tự nói.", onscreen: "Nguồn: {{nguon}}", visual: "Hiện logo/ảnh báo cáo nguồn", duration: [4, 6], words: [10, 18], requiresSlots: ["nguon"] },

  // ── 5.4 PAY — Payoff (3–5s) — deliversTag khớp promise hook (R1) ──────────
  { id: "PAY-01", type: "PAYOFF", text: "Và đây — chính là {{cai_duoc_hua}}.", onscreen: "Đây!", visual: "Reveal đúng thứ đã hứa ở hook", duration: [3, 5], words: [8, 14], deliversTag: "reveal" },
  { id: "PAY-02", type: "PAYOFF", text: "Chốt: nếu là tiền của tôi, tôi chọn {{lua_chon}} — vì {{ly_do_1cau}}.", onscreen: "Chốt", visual: "Nhìn thẳng cam, gật dứt khoát", duration: [3, 5], words: [12, 18], deliversTag: "verdict" },
  { id: "PAY-03", type: "PAYOFF", text: "Câu trả lời: {{dap_an}}. Gọn vậy thôi.", onscreen: "Đáp án", visual: "Nhìn thẳng cam, gật nhẹ", duration: [3, 5], words: [8, 14], deliversTag: "answer" },
  { id: "PAY-04", type: "PAYOFF", text: "Từ {{trang_thai_truoc}} thành {{trang_thai_sau}} — trong đúng {{khoang_tg}}.", onscreen: "Trước → Sau", visual: "Before/after dứt khoát", duration: [3, 5], words: [10, 16], deliversTag: "transformation" },
  { id: "PAY-05", type: "PAYOFF", text: "Và vị trí số 1 — {{lua_chon_tot_nhat}} — giờ thì bạn hiểu vì sao rồi đó.", onscreen: "#1", visual: "Chốt vị trí top của danh sách", duration: [3, 5], words: [10, 16], deliversTag: "list_complete" },
  { id: "PAY-06", type: "PAYOFF", text: "Nhưng thứ đáng giá nhất lại không nằm trong những gì tôi vừa kể — mà là {{twist}}.", onscreen: "Twist", visual: "Hạ giọng, tiết lộ cú twist cuối", duration: [3, 5], words: [12, 18], deliversTag: "proof" },
  { id: "PAY-07", type: "PAYOFF", text: "Và đó là cảm giác mỗi ngày khi bạn sống ở đây.", onscreen: "Cảm giác sống", visual: "Cảnh sống chậm, ánh sáng đẹp", duration: [3, 5], words: [8, 14], deliversTag: "experience" },

  // ── 5.5 CTA (3–5s) — map funnel + Manychat keyword ───────────────────────
  { id: "CTA-01", type: "CTA", text: "Comment '{{tu_khoa_cmt}}' — tôi gửi bạn {{qua_tang}} qua tin nhắn, miễn phí.", onscreen: "💬 {{tu_khoa_cmt}}", visual: "Chỉ xuống ô comment", duration: [3, 5], words: [12, 18], funnel: "lead_keyword" },
  { id: "CTA-02", type: "CTA", text: "Lưu video này — lúc đi xem nhà mở ra check từng mục.", onscreen: "🔖 Lưu lại", visual: "Tay chạm icon lưu", duration: [3, 5], words: [10, 16], funnel: "save" },
  { id: "CTA-03", type: "CTA", text: "Follow để xem phần {{phan_tiep}}: {{noi_dung_phan_sau}}.", onscreen: "Phần {{phan_tiep}}", visual: "Chỉ nút follow", duration: [3, 5], words: [8, 14], funnel: "follow_series" },
  { id: "CTA-04", type: "CTA", text: "Inbox tôi chữ '{{tu_khoa_cmt}}' kèm ngân sách — tôi lọc căn phù hợp, không phí gì cả.", onscreen: "📩 {{tu_khoa_cmt}}", visual: "Chỉ icon nhắn tin", duration: [3, 5], words: [12, 20], funnel: "lead_dm" },
  { id: "CTA-05", type: "CTA", text: "Gửi video này cho người sắp mua nhà mà bạn quý.", onscreen: "↗ Gửi tặng", visual: "Tay chạm icon share", duration: [3, 5], words: [8, 14], funnel: "share" },
  { id: "CTA-06", type: "CTA", text: "Bạn chọn {{lua_chon_a}} hay {{lua_chon_b}}? Comment đi, tôi đọc hết.", onscreen: "{{lua_chon_a}} / {{lua_chon_b}}", visual: "Giơ 2 tay 2 lựa chọn", duration: [3, 5], words: [10, 16], funnel: "engagement" },
  { id: "CTA-07", type: "CTA", text: "Lịch xem nhà cuối tuần này còn {{so_slot}} slot — đặt ở {{kenh_dat}}.", onscreen: "Còn {{so_slot}} slot", visual: "Chỉ vào lịch/bio", duration: [3, 5], words: [10, 16], funnel: "booking" },
  { id: "CTA-08", type: "CTA", text: "Còn thắc mắc gì về {{chu_de}}, để lại câu hỏi — video sau tôi trả lời.", onscreen: "Hỏi mình nhé", visual: "Mở lòng bàn tay mời hỏi", duration: [3, 5], words: [10, 16], funnel: "soft" },
  { id: "CTA-09", type: "CTA", text: "Bảng giá và mặt bằng đầy đủ, tôi để hết ở trang cá nhân.", onscreen: "Xem ở trang cá nhân", visual: "Chỉ lên avatar/bio", duration: [3, 5], words: [10, 16], funnel: "profile" },
  { id: "CTA-10", type: "CTA", text: "Thấy có ích thì follow — còn muốn nhận {{tai_lieu}} thì comment '{{tu_khoa_cmt}}'.", onscreen: "Follow + 💬 {{tu_khoa_cmt}}", visual: "Chỉ nút follow rồi ô comment", duration: [3, 5], words: [12, 20], funnel: "dual" },

  // ── 5.6 LP — Loop tail (1–2s, tăng rewatch) ──────────────────────────────
  { id: "LP-01", type: "LOOP", text: "Giờ quay lại câu hỏi đầu video — bạn đã có câu trả lời chưa?", onscreen: "Quay lại đầu", visual: "Cắt về đúng khung hình mở đầu", duration: [1, 2], words: [8, 14] },
  { id: "LP-02", type: "LOOP", text: "Và đó là lý do tôi nói câu đầu tiên.", onscreen: "", visual: "Cắt về khung mở đầu, gật đầu", duration: [1, 2], words: [6, 12] },
  { id: "LP-03", type: "LOOP", text: "[Cắt về đúng khung hình mở đầu] + im lặng 1 nhịp, gật đầu.", onscreen: "", visual: "Loop hình mở đầu, im lặng 1 nhịp", duration: [1, 2], words: [0, 0] },
  { id: "LP-04", type: "LOOP", text: "Xem lại từ đầu đi — đáp án tôi đã nhá ngay giây thứ hai.", onscreen: "Xem lại nhé", visual: "Cắt về giây thứ 2 của video", duration: [1, 2], words: [8, 14] },
];
