-- Sarene Residence (b008) — draft content blocks for the Assembly Engine.
-- Idempotent; node_id resolved by (project_id, node_key). Loads after
-- seed_knowledge_sarene.sql.
--
-- COMPLIANCE BY DESIGN: căn hộ siêu sang lõi Thủ Thiêm với thế mạnh thật (quỹ
-- đất kim cương khan hiếm, chính chủ Sala THADICO/THACO, hệ sinh thái 105ha hiện
-- hữu, kết nối Q1 ~5 phút) VÀ rủi ro thật (giá rumor chưa công bố, số căn/số
-- tháp mâu thuẫn, yield thấp ~2–3% nên lợi nhuận từ tăng giá vốn chứ không phải
-- dòng thuê, vốn vào rất lớn, THADICO vừa lần đầu phát hành trái phiếu). Node
-- giá/pháp lý/rủi ro dùng copy trung thực (neutral/story, KHÔNG fomo); số chưa
-- khoá để min_confidence unverified.
-- Placeholders: [TEN_DU_AN]=tên dự án · [TEN_SALE]=tên sale · [SDT]=điện thoại.

-- ── Batch A: hero · tổng quan · CĐT ──────────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('sarene','hook',1,'[TEN_DU_AN] — căn hộ hạng sang Lô 6.8 Bắc Sala, lõi Thủ Thiêm; dự án căn hộ ĐẦU TIÊN ở Sala sau gần 10 năm, do chính chủ KĐT Sala (THADICO/THACO) phát triển.','story','sales_claim',array['Vị trí','Chủ đầu tư']),
  ('sarene','hook',2,'Quỹ đất "kim cương" khan hiếm: ~1,63 ha mặt tiền Đại lộ Mai Chí Thọ, ~5 phút về Quận 1 — thừa hưởng ngay hệ sinh thái Sala 105ha đã hiện hữu.','neutral','sales_claim',array['Vị trí','Quy mô đất']),
  ('sarene','hook',3,'Câu chuyện 3 dòng: vị thế khan hiếm lõi Sala + chính chủ Sala phát triển + hạ tầng Thủ Thiêm đã chạy — lợi nhuận chủ yếu từ tăng giá vốn, không phải dòng thuê.','story','sales_claim',array[]::text[]),
  ('sarene','body',1,'Tổ hợp Residence & Commercial: 2 hầm + 3 tầng đế thương mại + tháp căn hộ 21 tầng, ~560 căn hạng sang 1–3PN (50–120 m²), do Đại Quang Minh (THADICO–THACO) phát triển, Thiso vận hành.','neutral','sales_claim',array['Kết cấu','Loại căn','Chủ đầu tư','Phân phối & vận hành']),
  ('sarene','body',2,'Khởi công 13/01/2026, mở bán dự kiến 6/2026, bàn giao 11/2027 — em luôn nói rõ giai đoạn để Anh/Chị tính dòng vốn (siêu sang nên vốn vào rất lớn).','neutral','sales_claim',array['Khởi công','Mở bán','Bàn giao']),
  ('sarene','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận thông tin chính thức, chính sách giữ chỗ & bảng giá [TEN_DU_AN] khi mở bán.','neutral','verified',array[]::text[]),
  ('sarene','cta',2,'Anh/Chị để lại số — [TEN_SALE] cập nhật tiến độ & tổ chức tham quan hệ sinh thái Sala hiện hữu (Zalo [SDT]).','neutral','verified',array[]::text[]),

  ('tq-vitri','hook',1,'[TEN_DU_AN] sở hữu tọa độ "kim cương": mặt tiền Đại lộ Mai Chí Thọ — trục xương sống Thủ Thiêm, ~5 phút qua cầu Ba Son/hầm Thủ Thiêm về Quận 1.','neutral','sales_claim',array[]::text[]),
  ('tq-vitri','body',1,'Liền kề công viên bờ sông, lâm viên Sala và trung tâm tài chính Thủ Thiêm tương lai; gần Metro số 2 và cao tốc Long Thành – kết nối sân bay Long Thành & Đông Nam Bộ.','neutral','sales_claim',array[]::text[]),
  ('tq-quymo','hook',1,'Sản phẩm giới hạn: ~560 căn 1–3PN (50–120 m²) trên ~1,63 ha — quy mô tinh, củng cố tính khan hiếm tại lõi Sala.','neutral','sales_claim',array['Số căn','Loại căn']),
  ('tq-quymo','body',1,'Cấu trúc "khối đế thương mại + tháp ở" tạo mô hình phức hợp residence + commercial ngay mặt tiền Mai Chí Thọ — vừa ở vừa khai thác thương mại.','neutral','sales_claim',array['Kết cấu']),
  ('tq-mauthuan','body',1,'Em chống nhiễu thông tin: dự án mới khởi công 1/2026, chưa có bảng hàng chính thức nên đang lưu hành nhiều con số (560 vs ~1.200 căn, 1 vs nhiều tháp). Em chỉ dùng số CĐT công bố khi tư vấn.','neutral','unverified',array[]::text[]),
  ('tq-thietke','hook',1,'Đội ngũ quốc tế (theo nguồn thị trường): tư vấn thiết kế Ong & Ong (Singapore), giám sát Artelia (Pháp), tổng thầu Central — định hướng hạng sang, sinh thái, khép kín tiêu chuẩn cao.','story','sales_claim',array[]::text[]),
  ('tq-sala','hook',1,'Điểm bán mạnh nhất của [TEN_DU_AN]: mua căn hộ ở đây = thừa hưởng NGAY hệ sinh thái Sala 105ha đã hiện hữu — mảng xanh, công viên bờ sông, cộng đồng cư dân tinh hoa sẵn có.','story','sales_claim',array[]::text[]),
  ('tq-sala','proof',1,'Khác "đô thị trên giấy": Sala 105ha đã vận hành nhiều năm với cư dân, trường, mall thật — Sarene là "mảnh ghép" khép kín bức tranh, giảm rủi ro chờ đợi hạ tầng.','neutral','sales_claim',array[]::text[]),
  ('tq-dinhvi','body',1,'[TEN_DU_AN] định vị hạng sang/siêu sang lõi Thủ Thiêm — dự án căn hộ đầu tiên ở Sala sau ~10 năm, đánh dấu THADICO "tái khởi động" sau giai đoạn hoàn thiện hạ tầng. Em tư vấn đúng tầm khách tinh hoa.','story','sales_claim',array[]::text[]),

  ('cdt-dqm','hook',1,'CĐT [TEN_DU_AN] là Đại Quang Minh (THADICO) — thành viên THACO, chính là "chủ nhà" gắn liền toàn bộ quá trình hình thành KĐT Sala.','neutral','sales_claim',array['Dự án lõi']),
  ('cdt-dqm','body',1,'Vốn điều lệ tăng lên 14.520 tỷ (1/2025); lĩnh vực BĐS cao cấp + hạ tầng giao thông; chủ tịch ông Trần Bá Dương (THACO) — năng lực tài chính mạnh, tầm nhìn dài hạn.','neutral','sales_claim',array['Vốn điều lệ','Lĩnh vực']),
  ('cdt-thaco','body',1,'THACO (Trường Hải) là tập đoàn đa ngành hậu thuẫn tài chính cho THADICO; hệ Thiso (Thiso Mall, Emart) vận hành bán lẻ Sala — tạo tính đồng bộ thương mại – cư dân.','neutral','sales_claim',array[]::text[]),
  ('cdt-track','proof',1,'Track record tại chính Sala: Sarimi, Sarica, Sadora, Saroma đã bàn giao đúng/sớm hạn, chất lượng đúng phối cảnh ("Singapore thu nhỏ"); giá thứ cấp tăng mạnh — bằng chứng năng lực & giữ giá.','neutral','sales_claim',array[]::text[]),
  ('cdt-hatang','body',1,'THADICO là nhà đầu tư 4 tuyến đường chính + đại lộ vòng cung và cầu Ba Son (Thủ Thiêm 2) theo hợp đồng BT — chính cách công ty có quỹ đất Sala, gắn liền hạ tầng khu.','neutral','sales_claim',array[]::text[]),
  ('cdt-taichinh','body',1,'Em nói thẳng điểm cần theo dõi: 1/2026 THADICO lần đầu phát hành trái phiếu (Thaco bảo lãnh); 2025–2028 ~81% doanh thu dự kiến từ Sala (gồm Sarene) — nên hỏi rõ bảo lãnh ngân hàng khi ký HĐMB.','neutral','unverified',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b008' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch B: pháp lý · sản phẩm · tiện ích ───────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('pl-quyhoach','body',1,'Nền pháp lý quy hoạch: Lô 6.8 thuộc quy hoạch phân khu 1/2.000 (QĐ 3165/2012); 7/2025 THADICO nhận 6 quyết định điều chỉnh chủ trương đầu tư tại Sala — pháp lý quy hoạch khu được khơi thông.','neutral','sales_claim',array[]::text[]),
  ('pl-hientrang','body',1,'Nói thẳng: dự án khởi công 1/2026, mở bán dự kiến 6/2026 — thời điểm mở bán sớm. Cần xác minh dự án đã có văn bản đủ điều kiện bán nhà ở hình thành trong tương lai của Sở Xây dựng hay chưa trước khi xuống tiền lớn.','neutral','unverified',array[]::text[]),
  ('pl-sohuu','body',1,'Căn hộ hạng sang để ở: thông lệ sổ hồng lâu dài cho người Việt, 50 năm cho người nước ngoài (room ngoại tối đa 30%/tòa); phần thương mại khối đế theo thời hạn đất. Chi tiết xác nhận trong HĐMB & GCN.','neutral','sales_claim',array[]::text[]),
  ('pl-thiso','body',1,'Thiso (thành viên Thaco) là đơn vị phân phối & vận hành — cũng là đơn vị vận hành bán lẻ Sala (Thiso Mall, Emart). Cùng "nhà Thaco" vận hành tạo đồng bộ thương mại – cư dân.','neutral','sales_claim',array[]::text[]),
  ('pl-checklist','body',1,'Trước cọc, Anh/Chị nên thu đủ: chủ trương + quy hoạch Lô 6.8, GPXD, văn bản đủ điều kiện bán (nếu chưa có chỉ giữ chỗ hoàn lại), bảng giá chính thức từ CĐT/Thiso (không dùng giá rumor), chứng thư bảo lãnh ngân hàng ghi đúng mã căn.','neutral','verified',array[]::text[]),
  ('pl-checklist','cta',1,'Em gửi checklist 6 bước thẩm định trước cọc [TEN_DU_AN] (chú ý dự án mở bán sớm) — nhắn [TEN_SALE] ([SDT]).','neutral','verified',array[]::text[]),

  ('pk-cancho','hook',1,'~560 căn 1–3PN (50–120 m²) — sản phẩm "giới hạn" tại lõi Sala, phủ từ căn 1PN tới 3PN lớn cho cả người ở và tích sản.','neutral','sales_claim',array['Số căn','Diện tích']),
  ('pk-loaihinh','body',1,'Định vị hạng sang đến siêu sang: thiết kế quốc tế, không gian sinh thái, tiện ích khép kín tiêu chuẩn cao — nhắm tệp tinh hoa coi trọng địa chỉ lõi & cộng đồng cư dân Sala.','story','sales_claim',array[]::text[]),
  ('pk-bangiao','body',1,'CĐT chưa công bố tiêu chuẩn bàn giao riêng. Tham chiếu phân khu Sala trước (Sarimi/Sadora) và siêu sang Thủ Thiêm: kỳ vọng hoàn thiện cao cấp/nội thất thương hiệu — em cập nhật khi có thông tin chính thức.','neutral','unverified',array[]::text[]),
  ('pk-tiendo','body',1,'Chu kỳ ~22 tháng từ khởi công (1/2026) đến bàn giao (11/2027) — khá nhanh cho 1 tháp 21 tầng, phù hợp năng lực tổng thầu & cam kết THADICO. Em cập nhật ảnh tiến độ theo tháng.','neutral','sales_claim',array[]::text[]),
  ('pk-thuongmai','hook',1,'3 tầng khối đế thương mại tạo phố thương mại cao cấp ngay mặt tiền Mai Chí Thọ — bổ trợ hệ bán lẻ Sala (Thiso Mall/Emart), tăng tiện ích & giá trị cho cư dân.','neutral','sales_claim',array[]::text[]),

  ('ti-sala105','hook',1,'Cư dân [TEN_DU_AN] thừa hưởng ngay 105ha hệ sinh thái Sala hiện hữu: mảng xanh, công viên bờ sông Sài Gòn, lâm viên và cộng đồng cư dân tinh hoa đã định hình.','story','sales_claim',array[]::text[]),
  ('ti-noikhu','body',1,'Hệ tiện ích nội khu khép kín tiêu chuẩn hạng sang (hồ bơi, gym, lounge, không gian xanh) đảm bảo riêng tư & an ninh — CĐT đang cập nhật chi tiết.','neutral','unverified',array[]::text[]),
  ('ti-thiso','body',1,'Khu Sala có Thiso Mall và đại siêu thị Emart (hệ Thaco) — cư dân Sarene tiếp cận mua sắm – giải trí hiện hữu ngay trong cùng hệ sinh thái.','neutral','sales_claim',array[]::text[]),
  ('ti-giaoduc-yte','body',1,'Hệ tiện ích xã hội Sala (quy hoạch/hiện hữu): trường quốc tế (Việt Úc), bệnh viện quốc tế, clubhouse, trung tâm thể thao — cư dân tiếp cận trong cùng khu đô thị.','neutral','sales_claim',array[]::text[]),
  ('ti-caocap','body',1,'Khu Sala/Thủ Thiêm quy hoạch các tiện ích biểu tượng: bến du thuyền, khách sạn 5 sao, công viên ven sông — nâng tầm trải nghiệm sống lõi Thủ Thiêm (theo quy hoạch).','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b008' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch C: hạ tầng · giá & thị trường ──────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('ht-maichitho','hook',1,'[TEN_DU_AN] sở hữu mặt tiền Đại lộ Mai Chí Thọ — trục Đông–Tây xương sống nối hầm Thủ Thiêm về Quận 1 và cao tốc Long Thành về phía Đông.','neutral','sales_claim',array[]::text[]),
  ('ht-cau','hook',1,'Kết nối lõi Quận 1 cực nhanh: ~5 phút qua cầu Ba Son (Thủ Thiêm 2) hoặc hầm Thủ Thiêm — lợi thế hiếm có của vị trí Sarene.','neutral','verified',array[]::text[]),
  ('ht-cbd','body',1,'Thủ Thiêm được quy hoạch thành trung tâm tài chính – thương mại mới (CBD) của TP.HCM; [TEN_DU_AN] nằm ở lõi khu vực này — câu chuyện tăng giá trung hạn theo CBD hoàn thiện.','story','sales_claim',array[]::text[]),
  ('ht-metro','body',1,'Hạ tầng vùng: gần Metro số 2 (quy hoạch qua Thủ Thiêm) và cao tốc TP.HCM – Long Thành – Dầu Giây, kết nối sân bay Long Thành (~cuối 2026) và Đông Nam Bộ.','neutral','sales_claim',array[]::text[]),
  ('ht-tod','body',1,'Khu vực hưởng lợi mô hình TOD — đô thị gắn giao thông công cộng; vị trí kết nối trực tiếp Mai Chí Thọ + lõi Thủ Thiêm nắm lợi thế giá trị dài hạn.','neutral','sales_claim',array[]::text[]),
  ('ht-tacdong','body',1,'Các lớp giá trị cộng hưởng: hệ sinh thái Sala 105ha đã hiện hữu (de-risk) + cầu Ba Son/hầm Thủ Thiêm/Mai Chí Thọ đã vận hành + CBD Thủ Thiêm đang hình thành + sân bay Long Thành (~cuối 2026).','story','sales_claim',array[]::text[]),

  ('cs-gia','body',1,'Nói rõ: giá Sarene CHƯA công bố chính thức (mở bán dự kiến 6/2026). Mức rumor ~200–250tr/m² đang lưu hành, khớp mặt bằng các phân khu Sala; căn 50–120 m² ước ~10 tỷ tới 30 tỷ+ — em chỉ báo con số khi có bảng giá phát hành.','neutral','unverified',array[]::text[]),
  ('cs-benchmark','body',1,'Khung định vị giá: Sarene (rumor ~200–250) ở nhóm lõi Thủ Thiêm — thấp hơn đỉnh Empire/Metropole nhưng cao hơn hẳn dự án ngoài lõi (Eaton/TGC ~120–210). Đây là "phần bù vị trí lõi".','neutral','sales_claim',array[]::text[]),
  ('cs-thanhtoan','body',1,'Chính sách bán hàng chưa công bố. Tham chiếu cao cấp Thủ Thiêm (vd Empire City): đặt chỗ hoàn lại → ký HĐMB ~10% → đóng giãn mỗi 6 tháng → ~45–50% khi nhận nhà, thường có hỗ trợ vay & ân hạn.','neutral','unverified',array[]::text[]),
  ('cs-yield','body',1,'Em tư vấn đúng bản chất: phân khúc siêu sang lõi Thủ Thiêm có yield cho thuê thấp (~2–3%/năm) do giá vốn rất cao — lợi nhuận đến chủ yếu từ TĂNG GIÁ VỐN, không phải dòng tiền thuê. Hợp khách tích sản dài hạn.','story','sales_claim',array[]::text[]),
  ('cs-thitruong','proof',1,'Bối cảnh: giá căn hộ Thủ Thiêm tăng ~30%/năm, +84% so 2 năm (Batdongsan 5/2026); Sarica/Sarimi Sala +40–80%. Động lực là khan cung — quỹ đất ven sông/lõi gần như đã hết (Avison Young).','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b008' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch D: cạnh tranh · phân tích đầu tư ───────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('tt-empire','hook',1,'Đối thủ nặng ký nhất lõi Thủ Thiêm là Empire City (~14,5ha, tháp 88 tầng, ~210–500tr/m²). So với [TEN_DU_AN]: Empire quy mô lớn & bờ sông; Sarene nhỏ gọn, nằm trong hệ sinh thái Sala đã hoàn thiện, giá vào mềm hơn phân khúc đỉnh.','neutral','sales_claim',array['Quy mô','Giá']),
  ('tt-metropole','body',1,'The Metropole Thủ Thiêm (SonKim Land, ~170–440tr/m²) là biểu tượng siêu sang đã bàn giao — benchmark giá & cộng đồng cao cấp để Anh/Chị tham chiếu khi cân Sarene.','neutral','sales_claim',array[]::text[]),
  ('tt-lotte','body',1,'Lotte Eco Smart City (một trong 4 đại dự án Thủ Thiêm) — phức hợp lớn, thị trường dự đoán giá ≥300tr/m². Nguồn cung siêu sang tương lai cần tính khi đánh giá thanh khoản.','neutral','sales_claim',array[]::text[]),
  ('tt-sala-noi','body',1,'Benchmark sát nhất là nội bộ Sala: Sarimi/Sarica/Sadora thứ cấp ~200–260tr/m², tăng 40–80%. Khách muốn vào Sala có thể chọn căn thứ cấp (ở ngay) vs Sarene (mới, chờ bàn giao 11/2027) — em phân tích cả hai.','neutral','sales_claim',array[]::text[]),
  ('tt-ngoailoi','body',1,'Nhóm ngoài lõi (Eaton Park, The Global City, Lumiere ~120–210tr/m²) tạo khoảng cách rõ với lõi Thủ Thiêm — giúp giải thích "phần bù vị trí lõi" của Sarene cho khách.','neutral','sales_claim',array[]::text[]),
  ('tt-dinhvi','body',1,'SWOT thẳng thắn — Mạnh: quỹ đất kim cương hiếm, chính chủ Sala (track record + de-risk), kết nối Q1 ~5 phút, giá vào mềm hơn đỉnh. Yếu: giá rumor chưa chốt, số căn mâu thuẫn, yield thấp & vốn rất lớn (kén khách), THADICO vừa lần đầu phát hành trái phiếu.','story','sales_claim',array[]::text[]),

  ('dt-thesis','hook',1,'Luận điểm đầu tư [TEN_DU_AN] gói trong 4 trụ: khan hiếm tuyệt đối lõi Sala · chính chủ Sala phát triển · hệ sinh thái hiện hữu (de-risk) · phần bù vị trí lõi còn dư địa.','story','sales_claim',array[]::text[]),
  ('dt-thesis','body',1,'Khác dự án vùng ven: đây là bài "tích sản tài sản khan hiếm" tại lõi Thủ Thiêm, kỳ vọng tăng giá vốn theo CBD hoàn thiện — KHÔNG phải bài dòng tiền cho thuê.','neutral','sales_claim',array[]::text[]),
  ('dt-dongtien','body',1,'Mô phỏng: căn 2PN ~80 m² × ~220tr/m² ≈ 17,6 tỷ (ước lượng) — vốn vào rất lớn, yield ~2–3% không đủ bù lãi vay (~8–10%). Em tư vấn dùng vốn tự có cao, xác định lợi nhuận từ tăng giá vốn dài hạn.','neutral','sales_claim',array[]::text[]),
  ('dt-ruiro','body',1,'Bản đồ rủi ro em luôn nói rõ: giá rumor chưa chính thức, số căn/số tháp mâu thuẫn, yield thấp + vốn lớn (thanh khoản hẹp), tiến độ THADICO lịch sử có hạng mục chậm, và nguồn cung siêu sang Thủ Thiêm có thể bung mạnh.','story','unverified',array[]::text[]),
  ('dt-khuyennghi','body',1,'Chọn theo mục tiêu: tích sản/giữ tài sản khan hiếm lõi Thủ Thiêm bằng vốn lớn → phù hợp; cần dòng tiền cho thuê hoặc lướt nhanh → KHÔNG hợp (yield ~2–3%, bàn giao 11/2027). Em tư vấn đúng khẩu vị.','neutral','sales_claim',array[]::text[]),
  ('dt-khuyennghi','cta',1,'Anh/Chị cho biết mục tiêu (ở/tích sản) và ngân sách — [TEN_SALE] tư vấn căn & phương án vốn phù hợp ([SDT]).','neutral','verified',array[]::text[]),
  ('dt-trigger','body',1,'Tín hiệu MUA mạnh hơn: CĐT công bố bảng giá hợp lý (≤ mặt bằng Sala ~200–260) + VB đủ điều kiện bán; làm rõ số căn & tiêu chuẩn bàn giao; CBD Thủ Thiêm triển khai đúng tiến độ. THẬN TRỌNG: giá vượt xa mặt bằng Sala, tiến độ/tài chính THADICO trục trặc, nguồn cung siêu sang bung mạnh.','neutral','sales_claim',array[]::text[]),
  ('dt-kh','body',1,'Tệp khách [TEN_DU_AN]: giới tinh hoa/doanh nhân coi trọng địa chỉ lõi Thủ Thiêm & cộng đồng Sala; nhà đầu tư tích sản dài hạn (giữ tài sản khan hiếm, kỳ vọng capital gain); khách nước ngoài/Việt kiều (lưu ý room ngoại 30%).','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b008' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;
