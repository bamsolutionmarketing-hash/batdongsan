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

-- ── Batch 2: remaining 24 nodes (lighter coverage) ───────────────────────────
-- Partial-verified nodes (metro-4, song-sg, vin-utilities, bien-dong-gia) stay
-- disclaimer-first; comparables/locations cite "giá rao" honestly.
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  -- Cơ cấu sản phẩm (vsp-products)
  ('vsp-products','hook',1,'Cơ cấu thấp tầng chính thức theo QH 1/500: 552 biệt thự + 2.491 nhà liền kề — con số có trong hồ sơ, không phải tin đồn.','neutral','verified',array['Biệt thự','Nhà liền kề']),
  ('vsp-products','body',1,'436 ha đất ở, 117 ha cây xanh – mặt nước, 150 ha cụm nghiên cứu – giáo dục — đúng khung đại học quốc tế của dự án.','neutral','verified',array['Đất ở','Cây xanh – mặt nước']),
  ('vsp-products','body',2,'Cao tầng 12–22 tầng, nhà ở xã hội 3–10 tầng — sản phẩm trải nhiều phân khúc, không chỉ thấp tầng cao cấp.','neutral','verified',array['Chung cư','Nhà ở xã hội']),
  ('vsp-products','proof',1,'552 biệt thự + 2.491 liền kề + 815 tái định cư theo 1/500 — đây là con số chuẩn để bác mọi rumor kiểu 18.443 căn.','neutral','verified',array['Biệt thự','Nhà liền kề','Nhà tái định cư']),
  -- Pháp nhân Berjaya (berjaya-vn)
  ('berjaya-vn','hook',1,'Khách tra pháp lý thấy tên Berjaya thay vì Vinhomes — đừng lo, đó là pháp nhân lịch sử mà Vinhomes sở hữu ~97,9%.','story','verified',array[]::text[]),
  ('berjaya-vn','body',1,'Pháp nhân gốc là Berjaya Land (Malaysia) cấp phép 2008, nay đã là công ty con của Vinhomes (~97,9%).','neutral','verified',array['Nguồn gốc','Hiện tại']),
  ('berjaya-vn','proof',1,'Mọi văn bản pháp lý (QĐ 80, 273, 1426) đều cấp cho pháp nhân này — minh bạch, có thể tra cứu.','neutral','verified',array['Vai trò']),
  -- QĐ 80 (qd-80)
  ('qd-80','hook',1,'QĐ 80/QĐ-TTg do Thủ tướng cấp (13/1/2025) — văn bản mở khóa để dự án chạy lại sau nhiều năm đình trệ.','neutral','verified',array['Cấp','Nội dung']),
  ('qd-80','body',1,'Quyết định cho phép tiến độ thực hiện 120 tháng — khung pháp lý dài hạn, bài bản.','neutral','verified',array['Tiến độ cho phép']),
  ('qd-80','proof',1,'Chủ trương đầu tư được điều chỉnh ở cấp Thủ tướng Chính phủ — nền pháp lý cao nhất cho một dự án.','neutral','verified',array['Cấp']),
  -- Metro 4 (metro-4) — disclaimer-first
  ('metro-4','hook',1,'Metro số 4 là tin tốt để kể, không phải tin tốt để định giá. Hôm nay chỉ nên tính Metro 2 và Vành đai 3 — thứ đang thi công thật.','story','verified',array[]::text[]),
  ('metro-4','body',1,'Depot Metro 4 quy hoạch tại Thạnh Xuân, Quận 12 (~25–27 ha) — là câu chuyện dài hạn 2030+.','neutral','verified',array['Depot 1']),
  ('metro-4','body',2,'Dự kiến khởi công sau Q2/2026, mục tiêu ~2035, còn ở giai đoạn nghiên cứu — em không khuyên trả giá hôm nay cho catalyst này.','story','verified',array['Khởi công','Mục tiêu hoàn thành']),
  -- Vành đai 2 (vd2)
  ('vd2','hook',1,'Vành đai 2 đi qua Quận 12 (trục QL1A hiện hữu) — giá trị chính là giảm tải khi khép kín vành đai.','neutral','verified',array['Liên quan Q12']),
  ('vd2','body',1,'Các đoạn còn thiếu phía Đông (Thủ Đức) đã khởi công 19/12/2025, mục tiêu 2027.','neutral','verified',array['Đoạn 1–2 (phía Đông)']),
  -- Cầu vượt Ngã Tư Đình (nga-tu-dinh)
  ('nga-tu-dinh','hook',1,'Cầu vượt Ngã Tư Đình (QL1 × Nguyễn Văn Quá) khởi công 19/8/2025 — gỡ một trong các điểm kẹt nặng nhất Quận 12.','neutral','verified',array['Vị trí','Khởi công']),
  ('nga-tu-dinh','body',1,'Catalyst nhỏ nhưng tác động trực tiếp đến trải nghiệm sống khu Đông Hưng Thuận / Trung Mỹ Tây.','neutral','verified',array['Vị trí']),
  -- Trục nội khu Q12 (truc-q12)
  ('truc-q12','hook',1,'Đừng né câu hỏi kẹt xe — hãy lật nó: chính vì kẹt xe mà giá Quận 12 đang rẻ hơn Gò Vấp 30–40%.','story','verified',array[]::text[]),
  ('truc-q12','body',1,'Các trục Hà Huy Giáp, Lê Văn Khương, Tô Ký quá tải giờ cao điểm — điểm trừ lớn nhất, cũng là lý do giá còn trũng.','neutral','verified',array['Hiện trạng']),
  ('truc-q12','body',2,'Mua bây giờ là mua cái bất tiện hôm nay để lấy hạ tầng ngày mai — Metro 2 và mở rộng QL22 đang chạy thật.','story','verified',array['Các trục chính']),
  -- QTSC (qtsc)
  ('qtsc','hook',1,'Công viên phần mềm Quang Trung — hub IT lớn nhất Việt Nam, nằm ngay Quận 12, nguồn cầu thuê ổn định.','neutral','verified',array['Vai trò']),
  ('qtsc','body',1,'Tệp khách nhân viên IT thu nhập khá tạo cầu thuê bền cho căn hộ khu Trung Mỹ Tây / Tân Thới Hiệp.','neutral','verified',array['Vị trí']),
  -- Cụm KCN (kcn)
  ('kcn','hook',1,'Vành đai KCN (Tân Bình, Vĩnh Lộc, Tân Phú Trung) tạo nền cầu thuê và cầu ở thực bền vững quanh Quận 12.','neutral','verified',array['Tác động']),
  ('kcn','body',1,'Cầu thuê từ công nhân kỹ thuật và quản lý cấp trung — lý do tỷ lệ lấp đầy cho thuê Q12 ổn định dù giá thuê không cao.','neutral','verified',array['Các KCN']),
  -- Sông Sài Gòn (song-sg) — honest about risk
  ('song-sg','hook',1,'Sông Sài Gòn giáp toàn bộ ranh phía Đông Quận 12 — quỹ đất ven sông và quy hoạch đường ven sông là tài sản dài hạn.','neutral','verified',array['Liên quan Q12','Tiềm năng']),
  ('song-sg','body',1,'Em nói thật: một phần khu ven sông nền đất yếu, ngập cục bộ — chi phí xây cao hơn, cần kiểm tra cốt nền từng vị trí.','story','verified',array['⚠ Rủi ro']),
  -- Hệ tiện ích Vin (vin-utilities) — disclaimer-first
  ('vin-utilities','hook',1,'Nếu vận hành đúng mô hình Vinhomes, đây có thể là cú hích tiện ích lớn nhất khu Tây Bắc — vùng đang thiếu trung tâm thương mại lớn.','story','verified',array[]::text[]),
  ('vin-utilities','body',1,'Cụm giáo dục 150 ha có trong quy hoạch: Vinschool và đại học quốc tế (~60.000 sinh viên).','neutral','verified',array['Giáo dục']),
  ('vin-utilities','body',2,'Tên tiện ích cụ thể như Vinmec, Vincom Mega Mall là kỳ vọng theo mô hình chuẩn — chưa có công bố riêng cho dự án, em sẽ cập nhật khi có.','story','verified',array['Thương mại']),
  -- P. Thới An (p-thoi-an)
  ('p-thoi-an','hook',1,'P. Thới An (mới) — tâm điểm phía Bắc Quận 12, có quy hoạch depot Metro 4 và compound Picity High Park.','neutral','verified',array['Điểm nhấn']),
  ('p-thoi-an','body',1,'Giá đất nền Thạnh Xuân vênh lớn giữa các nguồn (20–30 vs 44–60 tr/m²) — phải định giá theo từng vị trí, em luôn đối chiếu trước khi tư vấn.','story','verified',array['Đất nền Thạnh Xuân (cũ)']),
  -- P. An Phú Đông (p-an-phu-dong)
  ('p-an-phu-dong','hook',1,'P. An Phú Đông (mới) ôm toàn bộ mặt sông Sài Gòn phía Đông Quận 12 — quỹ đất nhà vườn, nhà phố ven sông.','neutral','verified',array['Đặc điểm']),
  ('p-an-phu-dong','body',1,'Thạnh Lộc cũ (55–80 tr/m²) có dải giá cao nhất Q12 nhờ giáp Gò Vấp và ven sông; An Phú Đông 30–45 tr/m².','neutral','verified',array['Đất nền']),
  -- P. Đông Hưng Thuận (p-dong-hung-thuan)
  ('p-dong-hung-thuan','hook',1,'P. Đông Hưng Thuận (mới) — cửa ngõ giáp Tân Bình/Gò Vấp, ngay nút An Sương, điểm đầu trục QL22 mở rộng đi Vinhomes.','neutral','verified',array['Vị trí']),
  ('p-dong-hung-thuan','body',1,'Phường đông dân nhất Quận 12 (182.895 dân); đất nền Tân Thới Nhất 50–70 tr/m² — mặt bằng cao nhất nhì quận.','neutral','verified',array['Quy mô','Đất nền']),
  -- P. Tân Thới Hiệp (p-tan-thoi-hiep)
  ('p-tan-thoi-hiep','hook',1,'P. Tân Thới Hiệp (mới) — khu dân cư hiện hữu, nhiều dự án đất nền cũ, mặt bằng giá trung bình thấp.','neutral','verified',array['Đặc điểm']),
  ('p-tan-thoi-hiep','body',1,'Đất nền Hiệp Thành 23–34 / Tân Thới Hiệp 25–33 tr/m² — hợp tệp mua ở thực ngân sách 3–5 tỷ nhà phố hẻm xe hơi.','neutral','verified',array['Đất nền']),
  -- Xuân Thới Sơn (xuan-thoi-son)
  ('xuan-thoi-son','hook',1,'Xuân Thới Sơn (Hóc Môn cũ) là địa bàn thực tế của Vinhomes Saigon Park — giáp ranh phía Tây Bắc Quận 12.','neutral','verified',array['Vai trò']),
  ('xuan-thoi-son','body',1,'Khách cần phân biệt rõ: đất Quận 12 hưởng lợi gián tiếp khác đất Hóc Môn sát dự án — hai vùng giá và pháp lý nền khác nhau.','story','verified',array['Quan hệ với Q12']),
  ('xuan-thoi-son','body',2,'Giáp QL22, Vành đai 3, kênh An Hạ, kênh Xáng — vị trí giao hạ tầng của khu Tây Bắc.','neutral','verified',array['Ranh giới']),
  -- Picity Sky Park (picity-sky)
  ('picity-sky','hook',1,'Picity Sky Park (Dĩ An) — cùng hệ Pi Group, giá ~40–60 tr/m², cho thấy căn hộ vùng giáp ranh đã lập mặt bằng cao hơn Quận 12.','neutral','verified',array['Giá','Vị trí']),
  ('picity-sky','body',1,'Quy mô 1.568 căn, bàn giao Q4/2026 – Q1/2027 — tham chiếu cửa ngõ Đông Bắc cho mặt bằng giá căn hộ mới.','neutral','verified',array['Quy mô','Bàn giao']),
  -- Hà Đô Thới An (hado-q12)
  ('hado-q12','hook',1,'Cụm Hà Đô tại Thới An (Quận 12) — nguồn cung căn hộ và nhà phố hiện hữu, cạnh tranh phân khúc trung cấp.','neutral','verified',array['CĐT','Vị trí']),
  ('hado-q12','body',1,'Đối thủ nguồn cung hiện hữu cùng Picity và các sản phẩm thứ cấp khu Bắc Quận 12.','neutral','verified',array['Vai trò']),
  -- Căn hộ Q12 cũ (canho-cu-q12)
  ('canho-cu-q12','hook',1,'Lớp căn hộ Q12 thế hệ cũ (Prosper Plaza, Tecco Green Nest, Topaz Home…) tạo sàn giá thấp cho thị trường.','neutral','verified',array['Đại diện']),
  ('canho-cu-q12','body',1,'Bàn giao trước 2020, phân khúc bình dân (~30–38 tr/m²) — khoảng cách với Picity là premium thị trường chấp nhận trả cho compound.','neutral','verified',array['Đặc điểm','Vai trò']),
  -- Cityland Gò Vấp (cityland-gv)
  ('cityland-gv','hook',1,'Nhà phố compound Cityland (Gò Vấp, giáp ranh Nam Q12) neo giá cao hơn Quận 12 đáng kể — benchmark trần giá lân cận.','neutral','verified',array['Vai trò','Vị trí']),
  ('cityland-gv','body',1,'Cityland Park Hills / Garden Hills — tham chiếu để định vị nhà phố Q12 và đối chiếu với giá rumor của Vinhomes.','neutral','verified',array['Dự án']),
  -- Happy One Hóc Môn (happy-one-hm)
  ('happy-one-hm','hook',1,'Happy One (Hóc Môn, trục QL22) — nguồn cung căn hộ hiếm hoi cùng hành lang hưởng lợi với Vinhomes Saigon Park.','neutral','verified',array['Vị trí','Vai trò']),
  ('happy-one-hm','body',1,'CĐT Vạn Xuân Group — dùng làm tham chiếu giá vùng dự án so với vùng Quận 12.','neutral','verified',array['CĐT']),
  -- Biến động giá (bien-dong-gia) — honest
  ('bien-dong-gia','hook',1,'Giá nhà đất Quận 12 +8,5% so cùng kỳ (Nhà Tốt, T5/2026) — đã phản ánh kỳ vọng Metro 2 + Vinhomes nhưng chưa sốt nóng.','neutral','verified',array['Nhà đất Q12 (Nhà Tốt, T5/2026)']),
  ('bien-dong-gia','body',1,'Em nói rõ: hai nguồn cho hai con số khác nhau (+8,5% nhà đất chung vs ~+15,5% riêng căn hộ) — cần đối chiếu thêm, chưa có dữ liệu CBRE/Savills.','story','verified',array['Căn hộ (một số nguồn khác)']),
  ('bien-dong-gia','body',2,'Giá rao thường cao hơn giao dịch thực 5–15%. Mức tăng một chữ số là vùng còn vào được, khác giai đoạn sốt đất 2021–2022.','neutral','verified',array['Chênh rao vs giao dịch']),
  -- NQ 1685 (nq-1685)
  ('nq-1685','hook',1,'Từ 1/7/2025, Quận 12 còn 5 phường (NQ 1685): Đông Hưng Thuận, Trung Mỹ Tây, Tân Thới Hiệp, Thới An, An Phú Đông.','neutral','verified',array['Kết quả']),
  ('nq-1685','body',1,'Hệ quả giao dịch: sổ/hợp đồng theo tên phường cũ vẫn hợp lệ, giấy tờ mới ghi tên phường mới — em thuộc bảng mapping để không nhầm thửa.','story','verified',array['Hiệu lực']),
  -- NQ 202 (nq-202)
  ('nq-202','hook',1,'Một câu đổi cuộc chơi với khách tỉnh: nay mua Quận 12 hay mua Dĩ An đều là hộ khẩu TP.HCM — khác nhau chỉ còn giá và hạ tầng.','story','verified',array[]::text[]),
  ('nq-202','body',1,'Từ 1/7/2025, TP.HCM sáp nhập Bình Dương và Bà Rịa–Vũng Tàu, bỏ cấp quận/huyện — Quận 12 chỉ còn là tên khu vực.','neutral','verified',array['Thay đổi lớn']),
  ('nq-202','proof',1,'Ranh giới tâm lý mua Bình Dương hay mua TP.HCM đã biến mất — so sánh giá Q12 với Dĩ An giờ là so sánh trong cùng một thành phố.','neutral','verified',array['Nội dung'])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n
  on n.project_id = '00000000-0000-0000-0000-00000000b001' and n.node_key = v.node_key
on conflict (node_id, role, variant_no) do nothing;
