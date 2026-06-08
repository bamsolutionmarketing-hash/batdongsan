-- Eaton Park (b006) — draft content blocks for the Assembly Engine.
-- Idempotent; node_id resolved by (project_id, node_key). Loads after
-- seed_knowledge_eaton.sql.
--
-- COMPLIANCE BY DESIGN: dự án hạng sang với thế mạnh thật (CĐT ngoại Gamuda
-- tài chính mạnh, pháp lý hoàn chỉnh đã có sổ + GPXD, sóng hạ tầng An Phú/
-- Metro 1/Long Thành) VÀ rủi ro thật (giá vào đã cao, tin đồn môi giới về
-- giá/lợi suất, rủi ro tiến độ ra sổ). Node giá & rủi ro dùng copy trung thực
-- (neutral/story, KHÔNG fomo); số chưa khoá để min_confidence unverified.
-- Placeholders: [TEN_DU_AN]=tên dự án · [TEN_SALE]=tên sale · [SDT]=điện thoại.

-- ── Batch A: hero · tổng quan · CĐT ──────────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('eaton','hook',1,'[TEN_DU_AN] — căn hộ hạng sang ~3,76 ha mặt tiền đại lộ Mai Chí Thọ, do CĐT ngoại Gamuda Land phát triển, kề Thủ Thiêm.','neutral','sales_claim',array['Vị trí','Nhà phát triển']),
  ('eaton','hook',2,'Quỹ đất hạng sang khan hiếm bậc nhất trục Mai Chí Thọ: 6 tháp ~1.968 căn, pháp lý hoàn chỉnh (đã có sổ đất + GPXD), bàn giao 2027.','story','sales_claim',array['Quy mô sản phẩm','Bàn giao']),
  ('eaton','hook',3,'Câu chuyện 3 dòng: đất hạng sang hiếm + CĐT ngoại tài chính mạnh + đón sóng hạ tầng nút giao An Phú & Metro 1 đúng nhịp bàn giao 2027.','story','sales_claim',array[]::text[]),
  ('eaton','body',1,'Quy mô ~3,76 ha (pháp lý 37.699,2 m²), 6 tháp A1–A6 cao 29–39 tầng, mật độ xây dựng chỉ ~40% — thấp cho căn hộ hạng sang.','neutral','sales_claim',array['Quy mô','Số tầng']),
  ('eaton','body',2,'Tên thương mại [TEN_DU_AN]; tên pháp lý "Khu nhà ở Tâm Lực", pháp nhân CĐT là CTCP Bất động sản Tâm Lực, nhà phát triển Gamuda Land — em ghi rõ để Anh/Chị đối chiếu hợp đồng.','neutral','verified',array['Tên thương mại','Pháp nhân CĐT','Nhà phát triển']),
  ('eaton','proof',1,'Khởi công 8/12/2023, đã thi công thực tế (A5/A6 lên tầng cao) — dự án hiện hữu, không phải hàng "trên giấy".','neutral','sales_claim',array['Khởi công','Bàn giao']),
  ('eaton','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận mặt bằng, bảng giá theo ngày hiệu lực & chính sách [TEN_DU_AN].','neutral','verified',array[]::text[]),
  ('eaton','cta',2,'Anh/Chị để lại số — [TEN_SALE] gửi tiến độ thi công & lịch tham quan nhà mẫu [TEN_DU_AN] (Zalo [SDT]).','neutral','verified',array[]::text[]),

  ('tq-vitri','hook',1,'[TEN_DU_AN] mặt tiền đại lộ Mai Chí Thọ 10 làn, cách CBD Quận 1 ~6,5km, kề Thủ Thiêm và ~3 phút tới ga Metro Rạch Chiếc.','neutral','sales_claim',array[]::text[]),
  ('tq-vitri','body',1,'Một trong số ít quỹ đất mới còn lại trên trục Mai Chí Thọ, lân cận Estella Heights, Imperia, Lexington và The Global City — vùng đã định hình đẳng cấp.','neutral','sales_claim',array[]::text[]),
  ('tq-quymo','hook',1,'6 tháp (A1–A6) · 1.968 căn hộ + 12 penthouse + 51 shop đế + 21 shophouse, mật độ chỉ ~40% — không gian sống thoáng cho hạng sang.','neutral','sales_claim',array['Tổng tháp','Căn hộ']),
  ('tq-quymo','proof',1,'Theo công bố quốc tế của Gamuda (The Edge Malaysia, 12/2024): khu đất 9,1 acre. Em dùng số trong bảng hàng/HĐMB chính thức khi tư vấn, không dùng con số gộp của môi giới.','neutral','sales_claim',array['Diện tích đất']),
  ('tq-thietke','hook',1,'Kiến trúc Biophilic (gắn con người – thiên nhiên) do AG INGO Studio (Singapore); 2 tháp Alpine & Forest đạt chứng nhận xanh EDGE của IFC – World Bank.','story','sales_claim',array[]::text[]),
  ('tq-thietke','body',1,'100% căn không "cửa đối cửa", mỗi căn chỉ 1 tường chung; trần cao tới 3,5m, kính Triple Low-E — riêng tư, hợp phong thủy và vận hành mát.','neutral','sales_claim',array[]::text[]),
  ('tq-tongthau','body',1,'Phần hầm/móng do Unicons (Coteccons) thi công; áp hệ tiêu chuẩn chất lượng GQUAS của Gamuda. Phần thân có nguồn nêu Coteccons/Hòa Bình — em xác minh theo từng gói thầu, không nói chắc khi chưa có hợp đồng.','neutral','sales_claim',array[]::text[]),
  ('tq-phankhu2','body',1,'Hai phân khu (A1–A4 và A5–A6) hầm thông nhau trong từng cụm; mở bán 3 giai đoạn: GĐ1 A5/A6, GĐ2 A1/A2, GĐ3 A3/A4.','neutral','sales_claim',array[]::text[]),
  ('tq-giaithuong','hook',1,'[TEN_DU_AN] đoạt 6 hạng mục tại Vietnam Property Awards 2024 (PropertyGuru) — gồm Best Luxury & Best Lifestyle Condo; Gamuda nhận tổng 13 giải.','neutral','sales_claim',array[]::text[]),

  ('cdt-gamuda','hook',1,'Nhà phát triển [TEN_DU_AN] là Gamuda Land — mảng BĐS của Gamuda Berhad (Malaysia), tập đoàn kỹ thuật – hạ tầng niêm yết, vào VN từ 2007.','neutral','sales_claim',array[]::text[]),
  ('cdt-gamuda','body',1,'Gốc nhà thầu hạ tầng (metro, cao tốc) cho Gamuda lợi thế thi công khác biệt so với CĐT thuần BĐS — yếu tố an tâm về tiến độ & chất lượng bàn giao.','story','sales_claim',array[]::text[]),
  ('cdt-gamuda','proof',1,'CĐT ngoại tài chính mạnh giảm rủi ro "treo dự án" — điểm cộng lớn so với một số chủ đầu tư nội gặp khó dòng tiền giai đoạn 2022–2024.','neutral','sales_claim',array[]::text[]),
  ('cdt-vietnam','body',1,'Danh mục VN dày (Gamuda City, Celadon, Elysian…) chứng minh năng lực vận hành dài hạn; [TEN_DU_AN] là dự án hạng sang đầu tiên của Gamuda tại lõi khu Đông.','neutral','sales_claim',array[]::text[]),
  ('cdt-taichinh','proof',1,'Gamuda FY2025 doanh thu kỷ lục RM16,4 tỷ, lợi nhuận ròng lần đầu đạt mốc RM1 tỷ — nền tài chính tập đoàn mẹ lành mạnh, đang tăng trưởng.','neutral','sales_claim',array['Doanh thu FY2025']),
  ('cdt-qtp','body',1,'Gamuda theo mô hình QTP (Quick Turnaround): mua đất sạch – triển khai – bàn giao trong ~5 năm. Mặt tốt: tiến độ nhanh; mặt cần lưu ý: bán nhanh – thoát nhanh, hợp khách đầu tư trung hạn.','story','sales_claim',array[]::text[]),
  ('cdt-banhang','proof',1,'Theo công bố Gamuda Berhad (Q1 FY2026): [TEN_DU_AN] đã bán ~95%, GDV RM3,3 tỷ — minh chứng hấp thụ thực tế, không chỉ truyền thông.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b006' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch B: pháp lý · sản phẩm/phân khu · tiện ích ──────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('pl-nguongoc','body',1,'Dự án tiền thân của Tâm Lực, được Gamuda mua lại 100% (2023, ~315,8 triệu USD) — một trong các thương vụ M&A BĐS lớn nhất VN năm đó, nền pháp lý đã sạch khi Gamuda triển khai.','neutral','sales_claim',array['Giá trị','Tỷ lệ mua']),
  ('pl-timeline','hook',1,'Điểm mạnh hiếm có ở hạng sang khu Đông: chuỗi pháp lý hoàn chỉnh & liên tục — đất đã có sổ TRƯỚC khi Gamuda triển khai.','neutral','verified',array[]::text[]),
  ('pl-gpxd','proof',1,'[TEN_DU_AN] đã có GCN quyền sử dụng đất (28/10/2022) và Giấy phép xây dựng 07/GPXD (17/2/2023) — đủ điều kiện ký HĐMB & chuyển nhượng. Em gửi bản scan để Anh/Chị đối chiếu.','neutral','verified',array['Giấy phép xây dựng','GCN QSDĐ','Điều kiện bán']),
  ('pl-sohuu','body',1,'Căn hộ: người Việt sở hữu lâu dài, người nước ngoài 50 năm (room ngoại 30%/tháp); shophouse/khối đế theo thời hạn đất đến 2072 — em phân biệt rõ khi tư vấn đầu tư khối thương mại.','neutral','verified',array['Căn hộ — người Việt','Shophouse / khối đế']),
  ('pl-nganhang','body',1,'6 ngân hàng đồng hành cho vay: Vietcombank, BIDV, VietinBank, OCB, cùng Hong Leong & Public Bank (Malaysia — đồng hương Gamuda), thuận cho cả khách Việt kiều/nước ngoài.','neutral','sales_claim',array[]::text[]),
  ('pl-luuy','body',1,'Em nói thẳng các điểm CHƯA được kiểm chứng: thương hiệu khách sạn 5 sao quản lý, giá GĐ3 185–220tr/m², cam kết tăng giá "x2–x3" hay lợi suất 7–12% đều là thông tin môi giới/kỳ vọng — dự án chưa bàn giao nên chưa có lịch sử giá kiểm chứng.','neutral','unverified',array[]::text[]),
  ('pl-luuy','body',2,'Có nguồn lo ngại "vài dự án Gamuda từng chậm ra sổ" — em khuyên yêu cầu cam kết tiến độ cấp sổ ghi trong HĐMB và theo dõi thực tế khi nhận bàn giao.','story','unverified',array[]::text[]),
  ('pl-checklist','body',1,'Trước khi cọc, Anh/Chị nên thu đủ: GPXD + sổ đất gốc, văn bản đủ điều kiện bán đúng tháp, chứng thư bảo lãnh ngân hàng ghi đúng mã căn, xác nhận căn đã giải chấp, và điều khoản phạt chậm bàn giao/ra sổ.','neutral','verified',array[]::text[]),
  ('pl-checklist','cta',1,'Em gửi checklist 6 bước thẩm định trước cọc [TEN_DU_AN] — nhắn [TEN_SALE] ([SDT]) để nhận bản đầy đủ.','neutral','verified',array[]::text[]),

  ('pk-a5a6','hook',1,'A5 Grove & A6 Strait (GĐ1) là 2 tháp vào ở SỚM NHẤT (dự kiến 2027) — hợp khách cần nhận nhà nhanh, rút ngắn thời gian "chôn vốn".','neutral','sales_claim',array['Vai trò','Bàn giao']),
  ('pk-a5a6','body',1,'673 căn, A5 ~39 tầng / A6 ~37 tầng; giá GĐ1 thấp nhất 3 đợt (~125tr/m²) nên biên tăng giá thứ cấp đã tích lũy tốt nhất — chủ yếu giao dịch chuyển nhượng.','neutral','sales_claim',array['Quy mô','Tiến độ']),
  ('pk-a1a2','hook',1,'A1 Alpine & A2 Forest (GĐ2) — cả 2 tháp đạt chứng nhận xanh EDGE (IFC), câu chuyện "xanh" mạnh nhất dự án, giá GĐ2 ~142tr/m².','story','sales_claim',array['Điểm nhấn','Giá GĐ2']),
  ('pk-a3a4','hook',1,'A3 Cove & A4 Lagoon (GĐ3) — 2 tháp cuối, view sông/rạch đẹp nhất, được CĐT định vị "mảnh ghép tinh hoa"; booking vượt >3 lần giỏ hàng (VIR 10/2025).','story','sales_claim',array['Vị trí','Ra mắt']),
  ('pk-a3a4','body',1,'Giá GĐ3 cao nhất 3 đợt (~7.000 USD/m² theo CGS Intl) và bàn giao muộn nhất (~Q4/2027) — hợp khách ưu tiên view & sản phẩm mới, chấp nhận vào vốn cao hơn.','neutral','unverified',array['Giá GĐ3','Tiến độ']),
  ('pk-loaicang','body',1,'Cơ cấu nghiêng mạnh về 2PN (~59%) — sản phẩm "xương sống" cho cả ở thật lẫn cho thuê; 1PN (~31%) thanh khoản cho thuê tốt nhất hướng chuyên gia.','neutral','sales_claim',array[]::text[]),
  ('pk-shophouse','body',1,'21 shophouse mặt tiền + 51 shop khối đế khai thác dòng tiền từ ~2.000 căn nội khu. Lưu ý: lấp đầy thương mại cần thời gian sau bàn giao, giá trị lớn nên thanh khoản hẹp hơn căn hộ.','neutral','sales_claim',array['Shophouse mặt tiền','Sở hữu']),
  ('pk-bangiao','hook',1,'Bàn giao full nội thất liền tường cao cấp: bếp Bosch/Smeg, thiết bị vệ sinh Grohe/Duravit/Kohler, điều hòa âm trần Daikin — vào ở/cho thuê được ngay.','neutral','sales_claim',array[]::text[]),
  ('pk-tiendo','body',1,'Em cập nhật ảnh tiến độ từng tháp theo tháng để Anh/Chị thấy tiến triển thật — mốc bàn giao 2027 luôn đi kèm chữ "dự kiến".','neutral','sales_claim',array[]::text[]),
  ('pk-thietkecan','hook',1,'~9–10 căn/sàn, 100% không "cửa đối cửa", trần cao tới 3,5m, bảo mật Face ID/QR — bố cục riêng tư hiếm có, điểm khách Việt rất coi trọng.','story','sales_claim',array[]::text[]),

  ('ti-onsen','hook',1,'Điểm nhấn "độc nhất": hồ khoáng nóng Onsen ngoài trời + phòng xông hơi tuyết (ice-sauna) — được quảng bá lần đầu xuất hiện tại một dự án căn hộ TP.HCM.','story','sales_claim',array[]::text[]),
  ('ti-hoboi','hook',1,'Hệ hồ bơi đa tầng: vô cực, liên hoàn, jacuzzi, hồ trẻ em và sky pool tầng thượng view sông & thành phố — đúng chất Biophilic xanh–nước.','story','sales_claim',array[]::text[]),
  ('ti-theduc','body',1,'Hệ thể chất: gym, yoga, golf 3D, sân thể thao đa năng — đáp ứng tệp cư dân trẻ thu nhập cao, cũng là nhóm khách thuê tiềm năng.','neutral','sales_claim',array[]::text[]),
  ('ti-congvien','hook',1,'Công viên ven sông, đường chạy/đạp xe ~1km, vườn BBQ và pet park >300m² (đoạt giải Best Pet-Friendly 2024) — không gian sống xanh cho gia đình.','story','sales_claim',array[]::text[]),
  ('ti-treem','body',1,'Khu nghệ thuật – giáo dục trẻ em hợp tác Legend Art & Marvel House; tiện ích hướng gia đình giúp giữ chân cư dân ở thật, nâng chất lượng cộng đồng & giá thuê dài hạn.','neutral','sales_claim',array[]::text[]),
  ('ti-clubhouse','body',1,'Clubhouse, lounge, coworking và studio sáng tạo nội dung — bắt trend làm việc linh hoạt của tệp cư dân trẻ; tổng dự án hơn 100 tiện ích.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b006' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch C: hạ tầng · giá & chính sách ──────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('ht-nutgiao','hook',1,'Chất xúc tác hạ tầng số 1 của [TEN_DU_AN]: nút giao 3 tầng An Phú (vốn 3.408 tỷ) chỉ cách ~450m — kỳ vọng giảm ùn tắc mạnh cửa ngõ phía Đông.','neutral','sales_claim',array[]::text[]),
  ('ht-nutgiao','proof',1,'Nút giao An Phú đang thi công thực tế (hầm HC1-02 đã thông 2/2026) — hạ tầng đang chạy, không phải quy hoạch trên giấy.','neutral','sales_claim',array[]::text[]),
  ('ht-metro','hook',1,'Metro số 1 đã vận hành thương mại từ 12/2024; ga Rạch Chiếc cách [TEN_DU_AN] ~3 phút di chuyển — kết nối nhanh về trung tâm & Thủ Đức.','neutral','verified',array[]::text[]),
  ('ht-maichitho','hook',1,'Mặt tiền đại lộ Mai Chí Thọ (70m, 10 làn) nối hầm Thủ Thiêm vào Quận 1 ~10–15 phút và đi cao tốc Long Thành — "địa chỉ" giao thông đắt giá.','neutral','sales_claim',array[]::text[]),
  ('ht-caotoc','body',1,'Cao tốc TP.HCM – Long Thành – Dầu Giây mở rộng 4→8 làn (dự kiến cuối 2026) và sân bay Long Thành GĐ1 (giữa/cuối 2026) — [TEN_DU_AN] nằm trên trục kết nối trực tiếp.','neutral','sales_claim',array[]::text[]),
  ('ht-vanhdai','body',1,'Vành đai 2 (đang khép kín), Vành đai 3 (giữa 2026), Liên Phường, cầu Thủ Thiêm — lưới giao thông đa hướng giảm phụ thuộc một trục, tăng giá trị kết nối vùng.','neutral','sales_claim',array[]::text[]),
  ('ht-tacdong','body',1,'Luận điểm thời điểm: khách vào trước khi hạ tầng hoàn thiện; bàn giao 2027 rơi sau khi nút giao & sân bay vận hành — cấu trúc thời gian thuận cho tăng giá, với điều kiện các mốc không trượt dài.','story','sales_claim',array[]::text[]),

  ('cs-lotrinhgia','body',1,'Theo khảo sát độc lập của CGS International (11/2025), giá sơ cấp tăng đều qua 3 đợt (~5.300 → 6.000 → 7.000 USD/m²), GĐ cuối hấp thụ ~95% — nguồn phân tích đáng tin hơn con số đồn của môi giới.','neutral','sales_claim',array[]::text[]),
  ('cs-gd1','hook',1,'Giá GĐ1 (A5/A6) ~125tr/m²: 1PN ~6,1–7 tỷ, 2PN ~8,6–9,4 tỷ, hấp thụ >90% — mặt bằng giá thấp nhất, khách vào sớm tích lũy biên tốt nhất.','neutral','sales_claim',array['Đơn giá','2PN','Hấp thụ']),
  ('cs-gd1','proof',1,'Dải giá GĐ1 (1PN ~6 tỷ, 2PN ~8,6–9,4 tỷ, 3PN từ ~13 tỷ) là số đã giao dịch — em đối chiếu trực tiếp trên bảng hàng/chuyển nhượng khi Anh/Chị chọn căn.','neutral','sales_claim',array['1PN','2PN','3PN']),
  ('cs-gd3','body',1,'Gamuda khởi động GĐ3 (A3/A4) tháng 10/2025: bán ~90% trong vài giờ, booking vượt >3 lần giỏ hàng (VIR 31/10/2025) — lực cầu thực tế ở phân khúc này còn mạnh.','neutral','sales_claim',array[]::text[]),
  ('cs-thucap','body',1,'Giá thứ cấp "all-in" lan truyền qua môi giới chỉ nên dùng tham khảo — em luôn báo theo bảng giá có ngày hiệu lực và hợp đồng chuyển nhượng thực tế.','neutral','unverified',array[]::text[]),
  ('cs-thanhtoan','body',1,'Chính sách thanh toán giãn (~30% đến nhận nhà) + vay 70–80% giúp giảm áp lực vốn ban đầu. Phí quản lý căn hộ ~29.000đ/m²/tháng, shophouse ~35.000đ/m²/tháng.','neutral','sales_claim',array[]::text[]),
  ('cs-yield','body',1,'Kỳ vọng cho thuê khu Quận 2 hợp lý ~4–6%/năm; các mức 7–12% thiếu cơ sở nên em không dùng. Lực đỡ trung hạn là khan cung: TP.HCM chỉ ~9.000 căn mở mới 9T/2025 so nhu cầu ~50.000 căn/năm (Savills).','neutral','unverified',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b006' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch D: thị trường/so sánh · phân tích đầu tư ───────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('tt-bicanh','body',1,'Bối cảnh: giá sơ cấp căn hộ TP.HCM +~8% so 2024 (Savills Q3/2025), khan cung mới, phân khúc cao cấp dẫn dắt hấp thụ. [TEN_DU_AN] bán đúng vùng giá cao cấp — lực đỡ tốt, nhưng mặt bằng đã cao nên biên an toàn mỏng hơn chu kỳ trước.','neutral','sales_claim',array[]::text[]),
  ('tt-globalcity','hook',1,'Khi khách phân vân [TEN_DU_AN] vs The Global City: TGC là đại đô thị 117ha (tiện ích tự chủ, "downtown mới"); Eaton là boutique hạng sang 3,76ha, mặt tiền Mai Chí Thọ, gần Thủ Thiêm/metro hơn.','neutral','sales_claim',array['Quy mô','Vị trí']),
  ('tt-globalcity','body',1,'Giá hai bên tương đương (~120–165tr/m²) — em tư vấn theo nhu cầu: thích hệ tiện ích đại đô thị chọn TGC; thích riêng tư + vị trí cận lõi + CĐT ngoại + bàn giao full nội thất chọn Eaton.','story','sales_claim',array['Giá căn hộ']),
  ('tt-thuthiem','body',1,'Thủ Thiêm là "trần giá" khu Đông (~180–400tr/m²), cao hơn [TEN_DU_AN] (~125–165tr) đáng kể — tạo dư địa kể chuyện: Eaton là hạng sang "cận lõi" giá vào hợp lý hơn, hưởng spillover khi Thủ Thiêm hoàn thiện.','story','sales_claim',array[]::text[]),
  ('tt-cu','body',1,'So dự án cũ Thảo Điền/An Phú (Masteri, Estella): rẻ hơn nhưng đã qua sử dụng, thiết kế/tiện ích lỗi thời. [TEN_DU_AN] là hàng sơ cấp hạng sang đầu tiên tại An Phú sau nhiều năm — premium phản ánh tính mới + khan hiếm.','neutral','sales_claim',array[]::text[]),
  ('tt-dinhvi','body',1,'Trung thực 2 chiều: mạnh ở quỹ đất hiếm + CĐT ngoại + pháp lý + tiện ích vượt trội; điểm cần cân nhắc là thương hiệu Gamuda ở hạng sang còn mới với khách VN, khu vực chưa có cộng đồng hiện hữu, và giá vào đã cao nên dư địa lướt sóng hẹp.','story','sales_claim',array[]::text[]),
  ('tt-thanhkhoan','body',1,'Quy luật thanh khoản: 1–2PN (6–12 tỷ) tệp mua & thuê lớn nhất, thoát nhanh nhất; 3PN/penthouse thiên tích sản; shophouse siêu hẹp. Khách cần thanh khoản nên chọn 1–2PN vị trí/view khác biệt.','neutral','sales_claim',array[]::text[]),

  ('dt-thesis','hook',1,'Luận điểm đầu tư [TEN_DU_AN] gói trong 5 trụ: đất hạng sang khan hiếm · pháp lý hoàn chỉnh · sóng hạ tầng đúng nhịp · CĐT ngoại tài chính mạnh · khan cung + đòn bẩy vốn thấp.','story','sales_claim',array[]::text[]),
  ('dt-thesis','body',1,'Điểm khác biệt với nhiều dự án khu Đông: đã có GCN QSDĐ (10/2022) + GPXD (2/2023) trước khi triển khai — giảm rủi ro pháp lý, nền tảng vững cho kỳ vọng giữ giá.','neutral','verified',array[]::text[]),
  ('dt-dongtien','body',1,'Mô phỏng: căn 2PN ~10,5 tỷ với chính sách giãn → vốn đến nhận nhà chỉ ~30%, hợp khách có dòng tiền tương lai hoặc kế hoạch bán trước bàn giao. Nếu dùng đòn bẩy, lưu ý lãi dồn về sau ân hạn.','neutral','sales_claim',array[]::text[]),
  ('dt-ruiro','body',1,'Bản đồ rủi ro em luôn nói rõ: pháp lý (đã tốt), tiến độ ra sổ (cần cam kết HĐMB), thanh khoản (chọn căn nhỏ), lãi suất sau ưu đãi, và nguồn cung khu Đông bung nhanh (TGC/Thủ Thiêm) có thể chững giá.','story','sales_claim',array[]::text[]),
  ('dt-khuyennghi','body',1,'Chọn theo mục tiêu: ở thật → A5/A6 nhận nhà sớm hoặc A1/A2 xanh EDGE; đầu tư thanh khoản → 1–2PN view đẹp; tích sản dài hạn → 3PN/penthouse. Em khớp căn theo đúng mục tiêu của Anh/Chị.','neutral','sales_claim',array[]::text[]),
  ('dt-khuyennghi','cta',1,'Anh/Chị cho biết mục tiêu (ở/đầu tư) và ngân sách — [TEN_SALE] lọc nhanh tháp/căn [TEN_DU_AN] phù hợp nhất ([SDT]).','neutral','verified',array[]::text[]),
  ('dt-trigger','body',1,'Tín hiệu MUA mạnh hơn: nút giao An Phú & sân bay Long Thành về đích đúng hạn 2026, Gamuda bàn giao A5/A6 đúng 2027 & ra sổ suôn sẻ, khan cung tiếp diễn. Tín hiệu THẬN TRỌNG: lãi suất tăng mạnh sau ưu đãi, nguồn cung khu Đông bung nhanh, tiến độ ra sổ chậm.','neutral','sales_claim',array[]::text[]),
  ('dt-kh','body',1,'Tệp khách [TEN_DU_AN]: gia đình trẻ thu nhập cao mua để ở (chuộng wellness, pet-friendly, riêng tư); chuyên gia/Việt kiều (thuận ngân hàng Malaysia, gần Thảo Điền/Thủ Thiêm); nhà đầu tư trung–dài hạn coi trọng pháp lý sạch & thương hiệu CĐT.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b006' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;
