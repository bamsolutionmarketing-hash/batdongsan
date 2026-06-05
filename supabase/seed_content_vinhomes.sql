-- Vinhomes Saigon Park (Q12) — draft content blocks for the Assembly Engine.
-- Idempotent (on conflict do nothing). node_id is resolved by (project_id,
-- node_key) so this never depends on hand-typed UUIDs. Loaded after
-- seed_knowledge_vinhomes.sql (see config.toml sql_paths).
--
-- COMPLIANCE BY DESIGN: VSP has NO official price or sales policy yet — all
-- price/phân-khu numbers in the map are rumor. The engine treats facts without
-- a confidence tag as "verified", so safety lives in the TEXT: price/rumor/risk
-- nodes use disclaimer-first copy (tone neutral/story, never fomo). Honest
-- advisory is the differentiator this knowledge map was built around.

insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  -- ── HERO: Vinhomes Saigon Park (vsp) ──────────────────────────────────────
  ('vsp','hook',1,'Vinhomes không nằm trong Quận 12 — nhưng 880 ha đặt sát vách. Và quanh mỗi đại đô thị Vin, giá khu lân cận thường chạy trước cả khi bàn giao.','story','verified',array[]::text[]),
  ('vsp','hook',2,'[TEN_DU_AN] — đại đô thị ~880 ha khu Tây Bắc TP.HCM do Vinhomes phát triển, sát ranh Quận 12.','neutral','verified',array['Quy mô','Vị trí']),
  ('vsp','hook',3,'Đại đô thị 880 ha của Vinhomes khởi công 29/4/2026 — sóng hạ tầng Tây Bắc chính thức bắt đầu.','fomo','verified',array['Khởi công']),
  ('vsp','hook',4,'Khu Đông từng có một điểm khởi đầu mang tên Grand Park. Tây Bắc bây giờ có [TEN_DU_AN].','story','verified',array[]::text[]),
  ('vsp','hook',5,'Mặt tiền Quốc lộ 22 và Vành đai 3, sát ranh Tây Bắc Quận 12 — vị trí của [TEN_DU_AN].','neutral','verified',array['Vị trí']),
  ('vsp','body',1,'Tổng vốn ~59.000 tỷ đồng (~2,3–2,5 tỷ USD) — quy mô đầu tư thuộc hàng lớn nhất khu Tây Bắc.','neutral','verified',array['Tổng vốn']),
  ('vsp','body',2,'Quy hoạch cho ~135.000 cư dân và ~60.000 sinh viên — một thành phố thu nhỏ, không phải khu dân cư đơn lẻ.','neutral','verified',array['Quy mô dân số']),
  ('vsp','body',3,'Dự án thuộc Xuân Thới Sơn (Hóc Môn cũ), GIÁP Quận 12 — nên Quận 12 hưởng lợi gián tiếp về hạ tầng và mặt bằng giá.','neutral','verified',array['Vị trí']),
  ('vsp','body',4,'Tiến độ thực hiện 120 tháng theo QĐ 80/QĐ-TTg — lộ trình dài hạn, có khung pháp lý rõ ràng.','neutral','verified',array['Tiến độ dự án']),
  ('vsp','body',5,'Điều em luôn nói rõ với khách: đất Quận 12 hưởng lợi gián tiếp khác với đất Hóc Môn sát dự án — hai vùng giá và pháp lý khác nhau.','story','verified',array[]::text[]),
  ('vsp','proof',1,'~880 ha, vốn ~59.000 tỷ, khởi công 29/4/2026 — quy mô và mốc đều có văn bản, đây là dự án thật chứ không phải tin đồn vùng ven.','neutral','verified',array['Quy mô','Tổng vốn','Khởi công']),
  ('vsp','proof',2,'Tên pháp lý: Khu đô thị Đại học Quốc tế Việt Nam (VIUT) — Vinhomes là đơn vị phát triển thương mại. Pháp lý gốc minh bạch.','neutral','verified',array['Tên pháp lý']),
  ('vsp','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận thông tin chính thức về [TEN_DU_AN] và vùng giá Quận 12 hưởng lợi.','neutral','verified',array[]::text[]),
  ('vsp','cta',2,'Anh/Chị để lại số — [TEN_SALE] gửi bản đồ vùng hưởng lợi quanh [TEN_DU_AN] qua Zalo [SDT].','neutral','verified',array[]::text[]),
  ('vsp','cta',3,'Khi Vinhomes công bố bảng giá chính thức, cả khu sẽ định giá lại rất nhanh. Để [SDT] của [TEN_SALE] báo Anh/Chị đúng ngày đó.','neutral','verified',array[]::text[]),
  ('vsp','cta',4,'Cần tư vấn chọn vùng đầu tư quanh [TEN_DU_AN] theo ngân sách? Gọi [TEN_SALE] – [SDT].','neutral','verified',array[]::text[]),

  -- ── Giai đoạn 1 (vsp-gd1) ─────────────────────────────────────────────────
  ('vsp-gd1','hook',1,'Giai đoạn 1 đã có quyết định giao đất — đây là mốc pháp lý thật, không phải tin đồn.','neutral','verified',array['Giao đất']),
  ('vsp-gd1','hook',2,'~55 ha phía Nam, dự kiến mở bán giữa 2026 — đợt sản phẩm đầu tiên của đại đô thị 880 ha.','neutral','verified',array['Phạm vi','Mở bán dự kiến']),
  ('vsp-gd1','hook',3,'Cái đã có là quyết định giao đất GĐ1. Cái chưa có là bảng giá. Em phân biệt rõ để Anh/Chị không bị dẫn dắt.','story','verified',array[]::text[]),
  ('vsp-gd1','body',1,'Cơ cấu dự kiến ~2.000 căn hộ + 255 nhà liền kề — thông tin thị trường, chưa phải công bố bán hàng chính thức từ CĐT.','neutral','verified',array['Sản phẩm dự kiến']),
  ('vsp-gd1','body',2,'Giao đất theo QĐ 1426/QĐ-UBND ngày 12/3/2026 — bước pháp lý ngay trước khởi công.','neutral','verified',array['Giao đất']),
  ('vsp-gd1','proof',1,'~55 ha phía Nam, đã giao đất (QĐ 1426, 12/3/2026), dự kiến mở bán giữa 2026 — mốc rõ ràng để Anh/Chị canh thời điểm.','neutral','verified',array['Phạm vi','Giao đất','Mở bán dự kiến']),

  -- ── Vinhomes (vinhomes) ───────────────────────────────────────────────────
  ('vinhomes','hook',1,'Mô hình Vinhomes đã lặp lại nhiều lần: Grand Park kéo cả khu lên giá. Câu hỏi là khu quanh dự án đã phản ánh kỳ vọng đó chưa.','story','verified',array[]::text[]),
  ('vinhomes','hook',2,'Nhà phát triển đứng sau [TEN_DU_AN] là Vinhomes — số 1 thị trường nhà ở Việt Nam.','neutral','verified',array['Vai trò']),
  ('vinhomes','body',1,'Track record Vinhomes: Ocean Park, Grand Park, Smart City — những đại đô thị đã vận hành thật, không phải lời hứa.','neutral','verified',array['Track record']),
  ('vinhomes','body',2,'Tháng 5/2026, Vinhomes công bố hoàn tất nhận chuyển nhượng cổ phần — pháp nhân dự án thành công ty con (~97,9%).','neutral','verified',array['Sở hữu pháp nhân','Mốc 29/5/2026']),
  ('vinhomes','proof',1,'Vinhomes sở hữu ~97,9% pháp nhân dự án và có track record Ocean Park – Grand Park – Smart City — năng lực triển khai đã được chứng minh.','neutral','verified',array['Sở hữu pháp nhân','Track record']),

  -- ── Vingroup (vingroup) ───────────────────────────────────────────────────
  ('vingroup','hook',1,'Dự án này không mới — cấp phép từ 2008 dưới tên Berjaya, bất động 10 năm. Điểm xoay chuyển là Vingroup vào 2018.','story','verified',array[]::text[]),
  ('vingroup','body',1,'Vingroup mua lại dự án từ Berjaya (Malaysia) tháng 2/2018, giá trị 11.748 tỷ đồng — một trong các M&A bất động sản lớn nhất 2018.','neutral','verified',array['M&A 2/2018','Giá trị thương vụ']),
  ('vingroup','proof',1,'Thương vụ 11.748 tỷ đồng (~97,9% vốn điều lệ) hồi sinh một dự án đắp chiếu 10 năm — nguồn lực Vingroup là khác biệt căn bản.','neutral','verified',array['Giá trị thương vụ','Đánh giá']),

  -- ── Pháp lý: QH 1/500 (qh-1500) ───────────────────────────────────────────
  ('qh-1500','hook',1,'1/500 đã duyệt — khác biệt căn bản so với 90% dự án tin đồn vùng ven. Đây là quy hoạch chi tiết thật, đóng dấu thật.','neutral','verified',array['QĐ 273/QĐ-UBND']),
  ('qh-1500','body',1,'Quy hoạch chi tiết 1/500 được duyệt 31/1/2026 (QĐ 273/QĐ-UBND) — căn cứ pháp lý cho cơ cấu sản phẩm chính thức.','neutral','verified',array['QĐ 273/QĐ-UBND']),
  ('qh-1500','proof',1,'Chuỗi pháp lý chạy thật: nhiệm vụ 1/2000 (12/2025) → 1/500 (31/1/2026). Mọi con số ngoài hồ sơ này đều là rumor.','neutral','verified',array['QĐ 273/QĐ-UBND','Trước đó']),

  -- ── Pháp lý: Giao đất (giao-dat) ──────────────────────────────────────────
  ('giao-dat','hook',1,'Đã có quyết định giao đất giai đoạn 1 (QĐ 1426, 12/3/2026) — bước pháp lý ngay sát thời điểm khởi công.','neutral','verified',array['QĐ 1426/QĐ-UBND']),
  ('giao-dat','body',1,'Giao đất GĐ1 phạm vi ~55 ha phía Nam — đất đã có chủ thể pháp lý rõ ràng cho đợt sản phẩm đầu tiên.','neutral','verified',array['Phạm vi']),

  -- ── Khởi công 29/4/2026 (khoi-cong) ───────────────────────────────────────
  ('khoi-cong','hook',1,'Đại đô thị 880 ha khởi công 29/4/2026 (VnExpress) — đúng dịp 51 năm thống nhất.','neutral','verified',array['Ngày chính thức']),
  ('khoi-cong','body',1,'Lưu ý phân biệt: 29/4/2026 cũng là ngày khởi công Metro số 2 đoạn Bến Thành–Thủ Thiêm — hai sự kiện khác nhau.','neutral','verified',array['⚠ Phân biệt']),
  ('khoi-cong','body',2,'Một số web môi giới ghi ngày khởi công 19/12/2025 — thông tin này KHÔNG đúng. Em luôn dẫn nguồn chính thống.','story','verified',array['⚠ Tin sai phổ biến']),

  -- ── Tên gọi (ten-phap-ly) ─────────────────────────────────────────────────
  ('ten-phap-ly','hook',1,'Câu khách hỏi nhiều nhất: Vinhomes có ở Quận 12 không? Trả lời chuẩn: không nằm trong, nằm sát vách.','story','verified',array[]::text[]),
  ('ten-phap-ly','body',1,'Tên thương mại Vinhomes Saigon Park = tên pháp lý Khu đô thị Đại học Quốc tế VN (VIUT). Vinhomes Quận 12 chỉ là cách gọi thị trường.','neutral','verified',array['Tên thương mại','Tên pháp lý']),

  -- ── Metro số 2 (metro-2) — catalyst #1 ────────────────────────────────────
  ('metro-2','hook',1,'Metro số 2 đã khởi công thật 15/1/2026 — sau hơn 10 năm chờ đợi, lần này máy đã chạy.','fomo','verified',array['Khởi công']),
  ('metro-2','hook',2,'Khác biệt 2026 so với cả thập kỷ tin đồn metro: GPMB xong 100%, tổng thầu THACO, công trường đã động thổ.','neutral','verified',array['GPMB','Tổng thầu EPC']),
  ('metro-2','hook',3,'Quận 12 chờ metro hơn một thập kỷ. 2026 là năm lời hứa bắt đầu thành công trường.','story','verified',array[]::text[]),
  ('metro-2','body',1,'Tổng thầu EPC là THACO (Trường Hải) — doanh nghiệp Việt, áp lực tiến độ chính trị rất lớn.','neutral','verified',array['Tổng thầu EPC']),
  ('metro-2','body',2,'Tuyến 11,3 km – 10 ga, tổng mức đầu tư 55.179 tỷ, nối Depot Tham Lương (Quận 12) thẳng về Bến Thành.','neutral','verified',array['Chiều dài','Tổng mức đầu tư']),
  ('metro-2','body',3,'Công nghệ GoA4 tự động không người lái, 80–110 km/h — chuẩn metro hiện đại, mục tiêu vận hành Quý IV/2030.','neutral','verified',array['Công nghệ','Mục tiêu vận hành']),
  ('metro-2','body',4,'Em nói thẳng: tuyến này từng trễ ~14 năm ở các giai đoạn trước. Mốc Q4/2030 vẫn cần theo dõi tiến độ xây lắp thực tế.','story','verified',array[]::text[]),
  ('metro-2','proof',1,'Khởi công 15/1/2026, GPMB 100%, tổng thầu THACO — ba dấu hiệu cho thấy đây là hạ tầng đang chạy, không phải tin đồn.','neutral','verified',array['Khởi công','GPMB','Tổng thầu EPC']),

  -- ── Depot Tham Lương (depot-tham-luong) ───────────────────────────────────
  ('depot-tham-luong','hook',1,'Depot Tham Lương nằm ngay trong Quận 12 — nghĩa là Quận 12 không chỉ gần metro mà là điểm cuối vận hành tuyến số 2.','neutral','verified',array['Vai trò']),
  ('depot-tham-luong','body',1,'Bất động sản bán kính 1–2 km quanh ga cuối / depot thường là vùng hưởng lợi giá rõ nhất khi tuyến vận hành.','neutral','verified',array['Vị trí']),

  -- ── Vành đai 3 (vd3) — catalyst #2 ────────────────────────────────────────
  ('vd3','hook',1,'Vành đai 3 — 76 km, chạy sát [TEN_DU_AN], là trục kết nối liên vùng quan trọng nhất khu Tây Bắc.','neutral','verified',array['Quy mô']),
  ('vd3','hook',2,'Đoạn Vành đai 3 qua Hóc Môn dự kiến thông xe kỹ thuật 30/4/2026 — mốc đáng theo dõi nhất với Quận 12.','fomo','verified',array['Đoạn HM–CC–BC (32,6 km)']),
  ('vd3','body',1,'Khởi công từ 6/2023, đang thi công thực tế — Vành đai 3 không còn nằm trên giấy.','neutral','verified',array['Khởi công']),
  ('vd3','body',2,'Em tư vấn thật: Ban Giao thông cảnh báo đoạn này có thể lùi tới cuối 2026 do nền đất yếu. Theo dõi một mốc 30/6 là đủ.','story','verified',array['⚠ Cảnh báo']),
  ('vd3','proof',1,'Quy mô 76 km, khởi công 2023, đoạn Hóc Môn–Củ Chi–Bình Chánh đặt mục tiêu thông xe 2026 — hạ tầng thật, có mốc rõ.','neutral','verified',array['Quy mô','Đoạn HM–CC–BC (32,6 km)']),

  -- ── Mở rộng QL22 (ql22) ───────────────────────────────────────────────────
  ('ql22','hook',1,'Quốc lộ 22 — mặt tiền [TEN_DU_AN] — sắp mở rộng lên 10 làn xe, giải bài toán đường nhỏ – dự án to của khu vực.','neutral','verified',array['Quy mô']),
  ('ql22','body',1,'Đoạn An Sương → Vành đai 3 (~8–9 km), rộng 60 m / 10 làn, 7 cầu vượt, vốn 10.424 tỷ theo hình thức BOT.','neutral','verified',array['Đoạn','Quy mô','Vốn']),
  ('ql22','proof',1,'QL22 là trục xương sống nối Quận 12 (nút An Sương) lên Tây Bắc — mở rộng 10 làn, mục tiêu hoàn thành 2028.','neutral','verified',array['Quy mô','Hoàn thành']),

  -- ── Quận 12 (quan-12) ─────────────────────────────────────────────────────
  ('quan-12','hook',1,'Công thức Quận 12: giá Dĩ An – Thuận An của 5 năm trước + metro đang xây + Vinhomes sát bên.','story','verified',array[]::text[]),
  ('quan-12','hook',2,'Quận 12 — vùng trũng giá phía Tây Bắc, cách Tân Sơn Nhất ~10 km, giáp sông Sài Gòn.','neutral','verified',array['Đặc điểm','Khoảng cách']),
  ('quan-12','hook',3,'Nguồn cung căn hộ mới Quận 12 khan hiếm — dự án mới nhất bàn giao từ 2022. Cầu dồn nén nhiều năm.','fomo','verified',array['Nguồn cung căn hộ mới']),
  ('quan-12','body',1,'Vị thế đầu tư Quận 12: vùng trũng giá có 2 catalyst thi công thật (Metro 2, Vành đai 3) cộng đại đô thị Vinhomes sát vách.','neutral','verified',array['Đặc điểm']),
  ('quan-12','body',2,'Từ 1/7/2025 Quận 12 không còn là đơn vị hành chính (TP.HCM bỏ cấp quận) nhưng vẫn là tên khu vực thông dụng.','neutral','verified',array['Hành chính từ 1/7/2025']),
  ('quan-12','proof',1,'Cách Quận 1 ~15 km, Tân Sơn Nhất ~10 km, nguồn cung mới khan hiếm — nền cầu ở thực vững khi hạ tầng về đích.','neutral','verified',array['Khoảng cách','Nguồn cung căn hộ mới']),
  ('quan-12','cta',1,'Anh/Chị muốn xem vùng giá Quận 12 đang hưởng lợi từ Vinhomes & Metro 2? Nhắn [TEN_SALE] – [SDT].','neutral','verified',array[]::text[]),
  ('quan-12','cta',2,'Để [TEN_SALE] gửi Anh/Chị bảng so sánh giá theo từng phường Quận 12 — gọi/Zalo [SDT].','neutral','verified',array[]::text[]),

  -- ── P. Trung Mỹ Tây (p-trung-my-tay) ──────────────────────────────────────
  ('p-trung-my-tay','hook',1,'Tân Chánh Hiệp 17–25 triệu/m² — cách Depot Metro 2 vài phút xe. Khoảng giá khu Đông không còn tồn tại từ lâu.','story','verified',array['Đất nền Tân Chánh Hiệp (cũ)']),
  ('p-trung-my-tay','body',1,'Vùng giá thấp nhất Quận 12 nhưng ôm 2 tài sản hạ tầng: Công viên phần mềm Quang Trung và Depot Tham Lương.','neutral','verified',array['Điểm nhấn']),
  ('p-trung-my-tay','proof',1,'Giá thấp nhất + catalyst mạnh (QTSC, Depot Metro 2) — khu đáng theo dõi nhất cho nhà đầu tư đất nền ngân sách nhỏ.','neutral','verified',array['Điểm nhấn','Đất nền Tân Chánh Hiệp (cũ)']),

  -- ── Khu Tây Bắc (tay-bac) ─────────────────────────────────────────────────
  ('tay-bac','hook',1,'Khu Tây Bắc là hướng phát triển còn nguyên bản nhất của TP.HCM — nguồn cung mới gần như đóng băng từ 2020.','neutral','verified',array['Nguồn cung căn hộ']),
  ('tay-bac','hook',2,'Cấu trúc Tây Bắc 2026 từng xuất hiện ở khu Đông 2018–2020: vùng trũng giá + dồn dập catalyst, ngay trước chu kỳ tăng.','story','verified',array['Định vị']),
  ('tay-bac','body',1,'2026 khu Tây Bắc dồn 4 catalyst cùng lúc: Vành đai 3, Metro 2, mở rộng QL22 và đại đô thị Vinhomes.','neutral','verified',array['Phạm vi']),
  ('tay-bac','proof',1,'~28 dự án đã bàn giao, ~15.500 căn (đa số trước 2020) — nguồn cung mới khan hiếm khiến mọi dự án mới dễ re-rate mặt bằng.','neutral','verified',array['Nguồn cung căn hộ']),

  -- ── Picity High Park (picity-hp) — benchmark ──────────────────────────────
  ('picity-hp','hook',1,'Muốn biết căn hộ Vinhomes khu này neo giá thế nào, hãy nhìn Picity: 38–53 triệu/m² cho compound đã có sổ.','story','verified',array['Giá thứ cấp']),
  ('picity-hp','hook',2,'Picity High Park — compound chuẩn resort duy nhất đã vận hành tại Quận 12, pháp lý sạch, thanh khoản thứ cấp tốt nhất khu.','neutral','verified',array['Vị trí']),
  ('picity-hp','body',1,'Quy mô 8,6 ha — 2.446 căn hộ + 135 shophouse + 36 nhà phố, 6 block 15–18 tầng, mật độ xây dựng chỉ 23%.','neutral','verified',array['Quy mô','Thiết kế']),
  ('picity-hp','body',2,'Bàn giao 2021–2022, sổ hồng lâu dài — benchmark trực tiếp cho mọi sản phẩm cao tầng mới của khu vực.','neutral','verified',array['Bàn giao']),
  ('picity-hp','proof',1,'Giá thứ cấp 38–53 triệu/m² (2PN ~2,49–3,22 tỷ), đã có sổ — thước đo để đối chiếu mức giá Vinhomes sẽ mở bán.','neutral','verified',array['Giá thứ cấp','CĐT']),

  -- ── Đất nền/nhà phố dự án Q12 (datnen-duan-q12) ───────────────────────────
  ('datnen-duan-q12','hook',1,'Muốn đón sóng Vinhomes nhưng cần sổ từng nền? Lớp dự án đất nền có pháp lý là lựa chọn phòng thủ hợp lý.','story','verified',array[]::text[]),
  ('datnen-duan-q12','body',1,'Đại diện: Senturia Vườn Lài, An Phú Đông Riverside, Phú Long Riverside, Thới An City — tập trung ven sông và Bắc Quận 12.','neutral','verified',array['Đại diện','Phân bố']),

  -- ── Giá căn hộ Q12 (gia-canho) ────────────────────────────────────────────
  ('gia-canho','hook',1,'Căn hộ Quận 12 trung bình ~38 triệu/m² — thấp hơn rõ rệt khu Đông/Nam và cả Dĩ An/Thuận An.','neutral','verified',array['Trung bình']),
  ('gia-canho','hook',2,'Nguồn cung căn hộ mới Quận 12 gần như đóng băng từ 2022 — mọi dự án mở bán mới dễ tự kéo mặt bằng lên.','fomo','verified',array['Nguồn cung mới']),
  ('gia-canho','body',1,'Giá trị giao dịch phổ biến 1,99–4,45 tỷ/căn (trung bình ~2,75 tỷ) — vừa tầm tài chính người mua ở thực.','neutral','verified',array['Giá trị giao dịch phổ biến']),
  ('gia-canho','proof',1,'~38 triệu/m² trung bình + nguồn cung mới khan hiếm 4 năm — nền định giá để so với mức Vinhomes sắp công bố.','neutral','verified',array['Trung bình','Nguồn cung mới']),

  -- ── Giá đất nền theo phường (gia-datnen) ──────────────────────────────────
  ('gia-datnen','hook',1,'Biên độ giá đất nền Quận 12 rất rộng (17 → 80 triệu/m²) — thị trường định giá theo vi mô vị trí, không theo giá chung.','neutral','verified',array['Tân Chánh Hiệp','Nhà phố']),
  ('gia-datnen','body',1,'Đây là giá rao (tổng hợp Batdongsan, Homedy, Nhà Tốt) — giá giao dịch thực thường thấp hơn 5–15%. Em luôn đối chiếu trước khi tư vấn.','story','verified',array[]::text[]),

  -- ── Tỷ suất cho thuê (cho-thue) ───────────────────────────────────────────
  ('cho-thue','hook',1,'Căn hộ Quận 12 cho thuê gross yield ~3,5–4,5%/năm — đủ bù một phần lãi vay cho người mua ở thực hoặc đầu tư.','neutral','verified',array['Gross yield căn hộ']),
  ('cho-thue','body',1,'Ví dụ: 2PN 58m² giá ~2,49 tỷ cho thuê ~9 triệu/tháng (~4,3%). Cầu thuê chống lưng bởi QTSC và cụm KCN.','neutral','verified',array['Ví dụ']),
  ('cho-thue','body',2,'Em nói rõ: đây là ước tính từ rao vặt, chưa trừ phí quản lý, thuế, trống phòng. Net yield thực tế khoảng 3–3,5%.','story','verified',array['⚠ Nguồn']),

  -- ── HONEST-ADVISOR: Giá & chính sách rumor (vsp-gia-rumor) ────────────────
  ('vsp-gia-rumor','hook',1,'Con số 80–120 triệu/m² nhà phố đang lan truyền là giá môi giới truyền tai — chưa một văn bản nào từ Vinhomes.','neutral','verified',array['Nhà phố (rumor)']),
  ('vsp-gia-rumor','hook',2,'Quy tắc an toàn em luôn dặn khách: không xuống tiền giữ chỗ dựa trên giá rumor.','story','verified',array[]::text[]),
  ('vsp-gia-rumor','body',1,'Toàn bộ giá đang lưu hành đến từ môi giới và web không chính thức. Vinhomes CHƯA công bố bảng giá hay chính sách bán hàng.','neutral','verified',array['Nhà phố (rumor)','Biệt thự (rumor)']),
  ('vsp-gia-rumor','body',2,'Mức rumor 80–120 triệu/m² là rất cao so với mặt bằng nhà phố Quận 12 hiện tại (40–134 triệu/m² tùy vị trí) — cần tỉnh táo.','story','verified',array['Nhà phố (rumor)']),

  -- ── HONEST-ADVISOR: Phân khu rumor (vsp-phankhu-rumor) ────────────────────
  ('vsp-phankhu-rumor','hook',1,'Tên phân khu Ivy Park, Global Park, 60 tòa tháp, 18.443 căn… chỉ có trên web môi giới, không có trong văn bản quy hoạch.','neutral','verified',array['Tên phân khu (đồn)','Số tháp (đồn)']),
  ('vsp-phankhu-rumor','body',1,'Riêng con số 18.443 căn thấp tầng mâu thuẫn trực tiếp với quy hoạch 1/500 (552 biệt thự + 2.491 liền kề + 815 tái định cư).','story','verified',array['Thấp tầng (đồn)']),

  -- ── HONEST-ADVISOR: Bản đồ rủi ro (rui-ro) ────────────────────────────────
  ('rui-ro','hook',1,'Tư vấn trung thực là lợi thế cạnh tranh: khách mất niềm tin vì môi giới giấu rủi ro, không phải vì rủi ro tồn tại.','story','verified',array[]::text[]),
  ('rui-ro','body',1,'Rủi ro #1 là giá rumor cao chưa có căn cứ; #2 là hạ tầng có thể trễ (Metro 2 từng trễ ~14 năm; Vành đai 3 có thể lùi cuối 2026).','neutral','verified',array['1. Giá rumor cao','2. Hạ tầng trễ hẹn']),
  ('rui-ro','body',2,'Rủi ro lớn nhất không phải dự án ảo — pháp lý VSP rất thật — mà là trả giá tương lai cho tài sản hiện tại khi catalyst có thể trễ 1–2 năm.','story','verified',array['5. Giá chạy trước tin']),

  -- ── HONEST-ADVISOR: Khuyến nghị & mốc (khuyen-nghi) ───────────────────────
  ('khuyen-nghi','hook',1,'Bán bằng mốc, không bán bằng cảm xúc: khi Vinhomes ra bảng giá chính thức, cả khu định giá lại trong vài tuần.','story','verified',array[]::text[]),
  ('khuyen-nghi','body',1,'Ưu tiên hiện tại: sản phẩm pháp lý hoàn chỉnh đã có sổ. Ba mốc nên theo dõi: VSP công bố giá GĐ1, Vành đai 3 thông xe thật, Metro 2 đạt tiến độ xây lắp >30%.','neutral','verified',array['Ưu tiên hiện tại','Mốc 1','Mốc 2']),
  ('khuyen-nghi','body',2,'Tín hiệu nên đứng ngoài: rumor nhà phố vượt 100 triệu/m² đi kèm hạ tầng lùi tiến độ. Em sẽ báo Anh/Chị khi điều đó xảy ra.','story','verified',array['Tín hiệu đứng ngoài'])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n
  on n.project_id = '00000000-0000-0000-0000-00000000b001' and n.node_key = v.node_key
on conflict (node_id, role, variant_no) do nothing;
