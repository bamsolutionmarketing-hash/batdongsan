-- The Global City (b002) — draft content blocks for the Assembly Engine.
-- Idempotent; node_id resolved by (project_id, node_key). Loads after
-- seed_knowledge_global_city.sql.
--
-- COMPLIANCE BY DESIGN: this is a premium project with real strengths (sổ hồng
-- SOHO, tiện ích hiện hữu, Foster) AND real risks (SDI lỗ/nợ + trái phiếu,
-- yield ~2%, vách đá lãi vay 11/2028, hạ tầng có thể trượt). Risk nodes use
-- disclaimer-first copy (tone neutral/story, never fomo) — honest advisory.

-- ── Batch A: hero · tổng quan · phân khu · pháp lý ───────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  -- HERO: The Global City (tgc)
  ('tgc','hook',1,'117 ha quỹ đất sạch cuối cùng tại lõi khu Đông, do hãng kiến trúc làm Apple Park quy hoạch — [TEN_DU_AN] định vị downtown mới của TP.HCM.','neutral','verified',array['Quy mô','Quy hoạch tổng thể']),
  ('tgc','hook',2,'Khác biệt lớn nhất của [TEN_DU_AN]: tiện ích đã hiện hữu (kênh nhạc nước, SOHO vận hành, sổ hồng đã trao) trước khi bán phần lớn căn hộ.','story','verified',array[]::text[]),
  ('tgc','hook',3,'Nằm giữa Thảo Điền đã thiết lập và Thủ Thiêm đang hình thành — [TEN_DU_AN] hưởng spillover cả hai cực giá trị.','neutral','verified',array['Vị trí']),
  ('tgc','hook',4,'Điểm rơi hạ tầng 2026–2028 (An Phú, Vành đai 3, sân bay Long Thành, Lotte Mall) trùng đúng chu kỳ bàn giao [TEN_DU_AN].','fomo','verified',array[]::text[]),
  ('tgc','hook',5,'Có dự án bán lời hứa. [TEN_DU_AN] bán thứ đã chạm được: nhạc nước đang phun, nhà phố đã có sổ, mall đang hoàn thiện.','story','verified',array[]::text[]),
  ('tgc','body',1,'Quy mô 117,4 ha, mật độ xây dựng chỉ ~28% — quỹ xanh và mặt nước lớn, hiếm có ở một dự án lõi nội đô.','neutral','verified',array['Quy mô']),
  ('tgc','body',2,'Nhà phát triển Masterise Homes; quy hoạch tổng thể Foster + Partners, cảnh quan WATG — bộ khung thiết kế đẳng cấp quốc tế.','neutral','verified',array['Nhà phát triển','Quy hoạch tổng thể']),
  ('tgc','body',3,'Vị trí Đỗ Xuân Hợp, P. Bình Trưng (Quận 2 cũ / TP. Thủ Đức) — 3 mặt tiền, giáp sông Rạch Chiếc, cách Thảo Điền ~5 phút.','neutral','verified',array['Vị trí']),
  ('tgc','body',4,'Khởi công 3/2021, tổng quy mô ~1.800–2.392 thấp tầng + ~8.000–10.000 căn hộ — một đại đô thị thực thụ, không phải dự án đơn lẻ.','neutral','verified',array['Khởi công','Sản phẩm']),
  ('tgc','body',5,'Em luôn nói rõ với khách: chủ đầu tư pháp lý trên giấy tờ là SDI Corp, Masterise là nhà phát triển — phân biệt này quan trọng khi đọc hợp đồng và thẩm định.','story','verified',array['Chủ đầu tư pháp lý','Nhà phát triển']),
  ('tgc','proof',1,'117,4 ha, mật độ ~28%, quy hoạch Foster + Partners, khởi công 3/2021 — quy mô và bộ khung thiết kế đều có thật, kiểm chứng được.','neutral','verified',array['Quy mô','Quy hoạch tổng thể','Khởi công']),
  ('tgc','proof',2,'Tiền thân là KĐT Sài Gòn Bình An, nay là [TEN_DU_AN] do Masterise phát triển — quỹ đất pháp lý gốc từ 2001, không phải dự án tin đồn.','neutral','verified',array['Tên thương mại','Chủ đầu tư pháp lý']),
  ('tgc','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận mặt bằng, bảng giá & chính sách từng phân khu [TEN_DU_AN].','neutral','verified',array[]::text[]),
  ('tgc','cta',2,'Anh/Chị để lại số — [TEN_SALE] gửi video flycam tiến độ và lịch tham quan nhà mẫu [TEN_DU_AN] (Zalo [SDT]).','neutral','verified',array[]::text[]),
  ('tgc','cta',3,'Muốn so sánh [TEN_DU_AN] với Thủ Thiêm/Thảo Điền theo đúng ngân sách? Gọi [TEN_SALE] – [SDT].','neutral','verified',array[]::text[]),
  ('tgc','cta',4,'Em gửi kèm checklist thẩm định pháp lý trước khi cọc — nhắn [TEN_SALE] ([SDT]) để nhận bản đầy đủ.','neutral','verified',array[]::text[]),

  -- TỔNG QUAN
  ('tq-vitri','hook',1,'[TEN_DU_AN] sở hữu 3 mặt tiền: Đỗ Xuân Hợp, Liên Phường 60m và đường song hành cao tốc Long Thành — hiếm dự án nào có vị thế kết nối này.','neutral','verified',array[]::text[]),
  ('tq-vitri','hook',2,'Nằm giữa Thảo Điền và Thủ Thiêm, giáp sông Rạch Chiếc — vị trí kẹp giữa hai cực giá trị của khu Đông.','story','verified',array[]::text[]),
  ('tq-vitri','body',1,'Cách Thảo Điền ~5 phút, Thủ Thiêm ~7–10 phút, lõi Quận 1 ~15–20 phút; kết nối trực tiếp trục cao tốc đi sân bay Long Thành.','neutral','verified',array[]::text[]),
  ('tq-vitri','body',2,'Đường Liên Phường 60m chạy xuyên dự án (Masterise chi hơn 350 tỷ, thông xe kỹ thuật 8/11/2025) — đại lộ mặt tiền của mall và các tháp.','neutral','verified',array[]::text[]),
  ('tq-foster','hook',1,'Quy hoạch tổng thể và kiến trúc do Foster + Partners — hãng làm Apple Park, The Gherkin — đảm nhận, lần đầu tại Việt Nam.','neutral','verified',array[]::text[]),
  ('tq-foster','body',1,'Thương hiệu thiết kế quốc tế là mã gen khó sao chép, hỗ trợ định giá premium và khả năng giữ giá thứ cấp dài hạn.','story','verified',array[]::text[]),
  ('tq-dinhvi','hook',1,'City-within-a-city: ở – làm việc – mua sắm – học hành – y tế – giải trí gói gọn trong một đô thị. Đó là định vị downtown mới của [TEN_DU_AN].','story','verified',array[]::text[]),
  ('tq-dinhvi','body',1,'Em luôn dẫn khẩu hiệu kèm bằng chứng hiện hữu: nhạc nước, phố SOHO, City Park đã vận hành — không chỉ nói downtown trên giấy.','story','verified',array[]::text[]),
  ('tq-quymo','hook',1,'117,4 ha, mật độ xây dựng chỉ ~28%, tới ~25% diện tích là xanh và mặt nước — không gian sống hiếm có ở lõi nội đô.','neutral','verified',array['Mật độ xây dựng','Xanh + mặt nước']),
  ('tq-quymo','body',1,'~13 ha công viên cảnh quan trong tổng 117,4 ha — quỹ xanh lớn là luận điểm bán hàng then chốt so với dự án cao tầng thuần túy cùng tầm giá.','neutral','verified',array['Công viên','Tổng diện tích']),
  ('tq-quymo','proof',1,'Tổng diện tích 1.174.221,9 m², mật độ ~28%, tổng thầu Tung Feng · An Phong · Central — con số quy hoạch rõ ràng.','neutral','verified',array['Tổng diện tích','Mật độ xây dựng','Tổng thầu']),

  -- PHÂN KHU: Masteri Park Place (flagship)
  ('pk-mpp','hook',1,'Masteri Park Place (CT5) — trái tim ven kênh nhạc nước, phân khu chủ lực để đầu tư trung hạn 2025–2026.','fomo','verified',array[]::text[]),
  ('pk-mpp','hook',2,'4 tháp căn hộ + 1 tháp văn phòng hạng A ngay lõi [TEN_DU_AN] — ra mắt 10/2025, view kênh nhạc nước.','neutral','verified',array['Quy mô','Ra mắt']),
  ('pk-mpp','hook',3,'Giá tham khảo ~110–145 triệu/m², chính sách đòn bẩy mạnh nhất hệ thống — Masteri Park Place vào đúng điểm rơi hạ tầng.','neutral','verified',array['Giá tham khảo']),
  ('pk-mpp','hook',4,'Vào trước cụm chất xúc tác 2026–2028, bàn giao Q1/2028 đúng lúc hệ sinh thái vận hành đầy đủ — cấu trúc thời gian hiếm khi đẹp như vậy.','story','verified',array['Tiến độ']),
  ('pk-mpp','body',1,'Quy mô 3,12 ha: 4 tháp căn hộ (24–27 tầng) + tháp văn phòng ~30 tầng, 3 tầng đế, 2 hầm liên thông.','neutral','verified',array['Quy mô']),
  ('pk-mpp','body',2,'Sản phẩm 1PN–4PN, Penthouse, Duplex, shophouse; diện tích 1PN 51,9–56 m² đến 4PN 128,5–135,3 m².','neutral','verified',array['Sản phẩm','Diện tích (tim tường)']),
  ('pk-mpp','body',3,'Giá theo căn: 1PN ~6,1–7,3 tỷ, 2PN ~8,5–10,3 tỷ — view sông/nhạc nước ~125–145 triệu/m².','neutral','verified',array['Giá theo căn','Giá tham khảo']),
  ('pk-mpp','body',4,'Tiến độ: khởi công tháp đầu Q2/2026, cất nóc dự kiến Q4/2027, bàn giao Q1/2028; ký HĐMB dự kiến T5/2026.','neutral','verified',array['Tiến độ','HĐMB']),
  ('pk-mpp','proof',1,'4 tháp + VP, ra mắt 10/2025, giá ~110–145 triệu/m², bàn giao Q1/2028 — phân khu lõi ven kênh với lộ trình rõ ràng.','neutral','verified',array['Quy mô','Giá tham khảo','Tiến độ']),
  ('pk-mpp','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận bảng hàng & chính sách Masteri Park Place trước giờ ký HĐMB.','neutral','verified',array[]::text[]),
  ('pk-mpp','cta',2,'Còn quỹ căn view kênh nhạc nước — để lại số, [TEN_SALE] ([SDT]) gửi vị trí căn đẹp theo ngân sách.','neutral','verified',array[]::text[]),

  -- PHÂN KHU: Cosmo Central
  ('pk-cosmo','hook',1,'Masteri Cosmo Central (CT4) — 6 tháp, 4 mặt tiền (kênh nhạc nước – Liên Phường – D3 – phố SOHO), ra mắt 15/1/2026.','neutral','verified',array['Quy mô','Vị trí']),
  ('pk-cosmo','hook',2,'Cosmo có chính sách tài chính dày nhất hệ [TEN_DU_AN] hiện tại — hỗ trợ lãi suất dài, chiết khấu sâu.','fomo','verified',array[]::text[]),
  ('pk-cosmo','hook',3,'Sát phố SOHO sầm uất với ngôn ngữ thiết kế Terra Tropical — Cosmo hợp khách ưu tiên dòng chính sách và sự nhộn nhịp.','story','verified',array['Thiết kế','Vị trí']),
  ('pk-cosmo','body',1,'6 tháp 19–29 tầng, 3 tầng đế, 2 hầm (CT3+CT4 thông nhau); cụm CT4 ra trước với 3 tòa A, B1, B2.','neutral','verified',array['Quy mô']),
  ('pk-cosmo','body',2,'Sản phẩm 1PN–4PN, Duplex, Penthouse, căn thương mại — đa dạng cho cả ở thực và đầu tư.','neutral','verified',array['Sản phẩm']),
  ('pk-cosmo','body',3,'So với Park Place: Cosmo hỗ trợ lãi suất dài hơn và chiết khấu sâu hơn, đổi lại vị trí sát SOHO (sôi động hơn, ồn hơn) thay vì lõi ven kênh.','story','verified',array['Vị trí']),
  ('pk-cosmo','proof',1,'6 tháp, 4 mặt tiền, ra mắt 15/1/2026, đang khoan cọc & thi công hầm — sản phẩm thật, tiến độ thật.','neutral','verified',array['Quy mô','Vị trí','Tiến độ 1/2026']),
  ('pk-cosmo','cta',1,'Cosmo Central đang có chính sách ưu đãi sâu — nhắn [TEN_SALE] ([SDT]) để nhận bảng tính dòng tiền theo từng căn.','neutral','verified',array[]::text[]),
  ('pk-cosmo','cta',2,'Để lại số, [TEN_SALE] gửi so sánh Cosmo vs Park Place theo mục tiêu của Anh/Chị — [SDT].','neutral','verified',array[]::text[]),

  -- PHÂN KHU: Masteri Grand View
  ('pk-mgv','hook',1,'Masteri Grand View — phép thử cao tầng đầu tiên của [TEN_DU_AN]: cất nóc 01/2026, bàn giao 2026.','neutral','verified',array['Tiến độ']),
  ('pk-mgv','hook',2,'2 tháp Spark & Glow, 616 căn, mở bán 11/2024 ~100 triệu/m² — phân khu đang về đích sớm nhất.','neutral','verified',array['Quy mô GĐ1','Mở bán']),
  ('pk-mgv','body',1,'Loại căn 1PN 56,6 m² đến 4PN 136–181 m², Penthouse 143–372 m² — dải sản phẩm rộng.','neutral','verified',array['Loại căn']),
  ('pk-mgv','body',2,'Em nói rõ: giá thứ cấp niêm yết 106,6–216,1 triệu/m² (Batdongsan, T2/2026) là giá rao, không phải giá khớp — cần đối chiếu giao dịch thực.','story','verified',array['Thứ cấp niêm yết']),
  ('pk-mgv','proof',1,'Nếu MGV bàn giao đúng hạn 2026 và ra sổ suôn sẻ, niềm tin lan sang toàn bộ mặt bằng giá các tháp sau (MPP, Cosmo).','neutral','verified',array['Tiến độ','Mở bán']),

  -- PHÂN KHU: SOHO
  ('pk-soho','hook',1,'Phố SOHO — 915 nhà phố thương mại đã bàn giao và trao sổ hồng từ 30/11/2024, đang vận hành thật.','neutral','verified',array['Quy mô','Sổ hồng']),
  ('pk-soho','hook',2,'Katinat, Phúc Long, Pizza 4P''s, Highlands… đã mở tại SOHO — bằng chứng dòng tiền thương mại đang chảy.','story','verified',array['Bàn giao']),
  ('pk-soho','body',1,'Nhà phố 95–141 m², 1 trệt + 4 lầu có thang máy; giá thị trường ~36–72 tỷ/căn (căn góc lớn tới ~100 tỷ).','neutral','verified',array['Diện tích đất','Giá thị trường']),
  ('pk-soho','body',2,'Đơn giá đất ~315–548 triệu/m² (CĐT công bố ~350–400) — phù hợp khách khai thác kinh doanh, đặc biệt căn đối diện Lotte Mall.','neutral','verified',array['Đơn giá đất']),
  ('pk-soho','proof',1,'915 căn, bàn giao xong 2/2024, sổ hồng trao từ 30/11/2024 — phân khu chứng minh dự án ra sổ được.','neutral','verified',array['Quy mô','Bàn giao','Sổ hồng']),

  -- PHÂN KHU: SOLA
  ('pk-sola','hook',1,'SOLA — Đảo Ánh Dương: biệt thự bán đảo 3 mặt giáp sông Rạch Chiếc, thiết kế Foster + Partners.','neutral','verified',array['Đặc điểm','Thiết kế']),
  ('pk-sola','hook',2,'Biệt thự đảo giữa downtown mới — khan hiếm tuyệt đối, không thể tái tạo quỹ đất tương tự.','story','verified',array['Đặc điểm']),
  ('pk-sola','body',1,'~426 căn trên ~9,86–12,3 ha, ~70.000 m² mặt nước; liên kế, song lập, đơn lập, dinh thự.','neutral','verified',array['Quy mô','Loại hình']),
  ('pk-sola','body',2,'Giá ~47–200 tỷ/căn (~400–450 triệu/m² đất). Phân khúc siêu sang: tài sản để giữ, thanh khoản hẹp — em tư vấn đúng tệp khách.','story','verified',array['Giá']),
  ('pk-sola','proof',1,'Bán đảo 3 mặt sông, thiết kế Foster + Partners, chính sách vay 70% HTLS đến 30/6/2027 — sản phẩm di sản cho giới chủ.','neutral','verified',array['Đặc điểm','Thiết kế','Chính sách']),

  -- PHÂN KHU: Lumière Midtown
  ('pk-lumiere','hook',1,'Lumière Midtown — 2 tháp, 808 căn, mặt tiền Liên Phường, đối diện trung tâm thương mại 123.000 m².','neutral','verified',array['Quy mô','Vị trí']),
  ('pk-lumiere','body',1,'Vị trí đối diện mall cho lợi thế khai thác cho thuê khi TTTM vận hành; bàn giao dự kiến T8/2027.','neutral','verified',array['Vị trí','Bàn giao']),

  -- PHÁP LÝ: sổ hồng SOHO (proof mạnh nhất)
  ('pl-sohong','hook',1,'Anh/Chị không cần tin lời em — cư dân phố SOHO đã nhận sổ hồng từ 30/11/2024. Đó là bằng chứng ra sổ thật của đại đô thị.','story','verified',array[]::text[]),
  ('pl-sohong','hook',2,'Trao sổ hồng SOHO chỉ ~12 tháng sau bàn giao — trả lời trực diện nỗi sợ lớn nhất của khách sau giai đoạn 2022–2023.','neutral','verified',array[]::text[]),
  ('pl-sohong','body',1,'Tiền lệ quy trình đã xác lập: bàn giao → hoàn công → cấp sổ trong khoảng một năm ở phân khu đầu tiên.','neutral','verified',array[]::text[]),
  ('pl-sohong','body',2,'Sổ hồng thực tế mạnh hơn mọi cam kết trên giấy — đây là node em luôn đưa ra đầu tiên khi khách lo pháp lý.','story','verified',array[]::text[]),

  -- PHÁP LÝ: GPXD & đủ điều kiện bán
  ('pl-gpxd','hook',1,'[TEN_DU_AN] có GPXD hạ tầng (155/GPXD, 18/12/2020) và văn bản đủ điều kiện bán nhà hình thành trong tương lai (CV 7742, 28/6/2022).','neutral','verified',array['GPXD hạ tầng','Đủ ĐK bán hàng']),
  ('pl-gpxd','body',1,'Nguyên tắc thẩm định: văn bản đủ điều kiện bán cấp theo từng tháp/phân khu — trước khi cọc tháp mới, yêu cầu đúng công văn của tháp đó.','story','verified',array['Đủ ĐK bán hàng']),
  ('pl-gpxd','proof',1,'GPXD 2020, đủ điều kiện bán 2022, CĐT công bố đã hoàn thành nghĩa vụ tiền sử dụng đất — nền pháp lý bán hàng đầy đủ.','neutral','verified',array['GPXD hạ tầng','Đủ ĐK bán hàng','Nghĩa vụ tài chính']),

  -- PHÁP LÝ: sở hữu
  ('pl-sohuu','hook',1,'Căn hộ [TEN_DU_AN] sở hữu lâu dài cho người Việt — lợi thế so với nhiều dự án căn hộ thời hạn 50 năm trên thị trường.','neutral','verified',array['Người Việt Nam']),
  ('pl-sohuu','body',1,'Người nước ngoài sở hữu 50 năm (có thể gia hạn); các khu thấp tầng/cao tầng/thương mại có giấy chứng nhận riêng theo CĐT.','neutral','verified',array['Người nước ngoài','Pháp lý đất']),

  -- PHÁP LÝ: checklist (honest-advisor)
  ('pl-checklist','hook',1,'Khoản đầu tư 6–20+ tỷ xứng đáng 5–10 triệu phí luật sư rà hợp đồng độc lập. Em luôn khuyến nghị khách làm điều này.','story','verified',array[]::text[]),
  ('pl-checklist','body',1,'Trước khi cọc: kiểm tra công văn đủ điều kiện bán đúng tháp, xác nhận căn đã giải chấp, chứng thư bảo lãnh ngân hàng ghi đúng mã căn.','neutral','verified',array[]::text[]),
  ('pl-checklist','body',2,'Đối chiếu tiến độ thanh toán với trần luật: không quá 70% trước bàn giao, không quá 95% trước khi cấp sổ. Em đồng hành từng bước.','story','verified',array[]::text[]),

  -- PHÁP LÝ: hồ sơ rủi ro lịch sử (RISK honest-advisor)
  ('pl-luuy','hook',1,'Em nói thẳng phần ít môi giới nói: dự án có hồ sơ rủi ro lịch sử — tồn tại từ thanh tra giai đoạn cũ, khối trái phiếu 2021–2022, một vụ tranh chấp bán hàng.','story','verified',array[]::text[]),
  ('pl-luuy','hook',2,'Biết rủi ro để quản trị, không phải để sợ — đó là cách tư vấn em chọn với một khoản tiền lớn.','story','verified',array[]::text[]),
  ('pl-luuy','body',1,'Các tồn tại lịch sử (ký quỹ, ĐTM, tiền sử dụng đất, tái định cư) cần theo dõi xử lý dứt điểm — em cập nhật khi có tiến triển.','neutral','verified',array[]::text[]),
  ('pl-luuy','body',2,'Cách giảm thiểu: làm đủ checklist 7 bước, luật sư rà hợp đồng, không thanh toán vượt trần luật. Minh bạch là để Anh/Chị an tâm.','story','verified',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b002' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch B: CĐT · tiện ích · hạ tầng · thị trường/đầu tư · imported ──────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  -- CĐT
  ('cdt-masterise','hook',1,'Nhà phát triển [TEN_DU_AN] là Masterise Homes — nhà phát triển bất động sản hàng hiệu lớn nhất Đông Nam Á.','neutral','verified',array[]::text[]),
  ('cdt-masterise','hook',2,'Masterise hợp tác Marriott, Elie Saab, Foster + Partners — chuẩn hàng hiệu hiếm chủ đầu tư Việt nào có.','story','verified',array[]::text[]),
  ('cdt-masterise','body',1,'Masterise là nhà phát triển; chủ đầu tư pháp lý trên giấy tờ là SDI Corp. Phân biệt này quan trọng khi đọc hợp đồng — em luôn nói rõ.','story','verified',array[]::text[]),
  ('cdt-masterise','body',2,'Năng lực bàn giao đã được chứng minh qua chuỗi Masteri, Grand Marina, The Rivus — không chỉ là lời hứa trên brochure.','neutral','verified',array[]::text[]),
  ('cdt-track','hook',1,'Muốn biết Masterise giữ giá thế nào, nhìn Masteri Thảo Điền: mở ~27–35 triệu/m², nay thứ cấp ~100 triệu/m².','story','verified',array[]::text[]),
  ('cdt-track','hook',2,'Grand Marina (Marriott), The Rivus (Elie Saab) — chuỗi branded residences của Masterise là bằng chứng tăng giá hữu ích khi tư vấn.','neutral','verified',array[]::text[]),
  ('cdt-track','body',1,'Logic bán hàng: chuỗi Masteri có lịch sử bàn giao thật và thanh khoản thứ cấp tốt — nền tảng cho kỳ vọng giữ giá.','neutral','verified',array[]::text[]),
  ('cdt-track','body',2,'Lưu ý trung thực: hiệu suất quá khứ không bảo đảm tương lai; mặt bằng giá vào hiện đã cao hơn chu kỳ trước rất nhiều.','story','verified',array[]::text[]),
  -- CĐT: SDI (RISK honest-advisor)
  ('cdt-sdi','hook',1,'Em nói thẳng về pháp nhân: SDI Corp lỗ sau thuế hơn 3.096 tỷ năm 2022, nợ phải trả gấp 128 lần vốn chủ — con số cần biết trước khi xuống tiền.','story','verified',array['Lỗ sau thuế 2022','Nợ phải trả']),
  ('cdt-sdi','hook',2,'Chủ đầu tư pháp lý là SDI Corp (không phải Masterise) — đây là điểm em luôn minh bạch để Anh/Chị tự thẩm định.','story','verified',array[]::text[]),
  ('cdt-sdi','body',1,'Số liệu công bố HNX (2022): lỗ 3.096 tỷ, ROE âm 413,5%, vốn chủ còn ~749 tỷ, dư nợ trái phiếu 6.573 tỷ.','neutral','verified',array['Lỗ sau thuế 2022','ROE','Vốn chủ sở hữu','Dư nợ trái phiếu']),
  ('cdt-sdi','body',2,'Giảm thiểu rủi ro pháp nhân: yêu cầu chứng thư bảo lãnh ngân hàng cho từng căn, luật sư rà hợp đồng, không thanh toán vượt trần luật.','story','verified',array[]::text[]),

  -- TIỆN ÍCH
  ('ti-kenh','hook',1,'Kênh nhạc nước The Canal of Love dài 2 km đã vận hành từ 9/2023 — tiện ích đinh hiện hữu trước khi bán phần lớn căn hộ.','story','verified',array[]::text[]),
  ('ti-kenh','hook',2,'Ngược quy trình thông thường: ở [TEN_DU_AN], tiện ích biểu tượng đã chạy thật, không phải phối cảnh.','neutral','verified',array[]::text[]),
  ('ti-kenh','body',1,'Kênh nhạc nước là máy tạo traffic — điểm check-in kéo khách toàn thành phố về dự án, nền cho khai thác thương mại SOHO.','neutral','verified',array[]::text[]),
  ('ti-lotte','hook',1,'Trung tâm thương mại 123.000 m² (nguồn CĐT/đại lý: Lotte) trên trục Liên Phường, dự kiến khai trương cuối 2026.','neutral','verified',array['Quy mô','Tiến độ']),
  ('ti-lotte','body',1,'Ngày khai trương mall là chất xúc tác giá mạnh nhất nội khu — giá thuê và giá bán quanh mall thường tăng rõ 6–12 tháng quanh mốc này.','neutral','verified',array['Vị trí']),
  ('ti-lotte','body',2,'Em nói rõ: hợp tác Lotte do nguồn CĐT/đại lý công bố, chưa có thông cáo độc lập từ Lotte — theo dõi mốc khai trương chính thức.','story','verified',array['Thương hiệu']),
  ('ti-kings','hook',1,'King''s College Wimbledon dự kiến khai giảng 8/2027 trong [TEN_DU_AN] — trường quốc tế đẳng cấp ngay nội khu.','neutral','verified',array[]::text[]),
  ('ti-kings','body',1,'Campus gần 2 ha, nhận học sinh 2–18 tuổi — lực hút mạnh với gia đình trẻ và tệp khách thuê chuyên gia.','neutral','verified',array[]::text[]),

  -- HẠ TẦNG
  ('ht-anphu','hook',1,'Nút giao An Phú (>3.400 tỷ) — công trình tác động trực tiếp nhất tới đường vào [TEN_DU_AN] từ trung tâm, đích 30/6/2026.','neutral','verified',array[]::text[]),
  ('ht-anphu','body',1,'Tổng tiến độ ~70% (3/2026), hầm chui HC1 đã thông xe 2/2/2026 — mốc 30/6/2026 nếu đạt là chất xúc tác tâm lý đúng giai đoạn ký HĐMB.','neutral','verified',array[]::text[]),
  ('ht-longthanh','hook',1,'Sân bay Long Thành khai thác thương mại Q4/2026 — [TEN_DU_AN] nằm trên trục cao tốc đi sân bay, hưởng lợi kép.','neutral','verified',array[]::text[]),
  ('ht-longthanh','hook',2,'Chuyến bay kỹ thuật đầu tiên đã hạ cánh Long Thành 15/12/2025 — siêu sân bay 25 triệu khách/năm giai đoạn 1 đang về đích.','fomo','verified',array[]::text[]),
  ('ht-longthanh','body',1,'Long Thành đón tệp chuyên gia/quản lý quốc tế về khu Đông — nguồn cầu thuê và mua ở thực bền cho [TEN_DU_AN].','neutral','verified',array[]::text[]),
  ('ht-vd3','hook',1,'Vành đai 3 (76,3 km) mục tiêu thông xe 30/4/2026, hoàn thành giữa 2026 — tái phân bố dân cư và logistics về phía Đông.','neutral','verified',array[]::text[]),
  ('ht-vd3','body',1,'Vành đai 3 rút ngắn liên kết vùng Bình Dương – Đồng Nai – Long An, là nền cho chu kỳ giá khu Đông 2026–2030.','neutral','verified',array[]::text[]),
  ('ht-tacdong','hook',1,'Điểm rơi hạ tầng 2026–2028: An Phú, Vành đai 3, Long Thành, Lotte Mall, King''s College cùng về đích — cửa sổ cộng hưởng hiếm có.','story','verified',array[]::text[]),
  ('ht-tacdong','hook',2,'Người mua giai đoạn 2025–2026 đang vào TRƯỚC cụm chất xúc tác; bàn giao 2028 rơi đúng lúc hệ sinh thái vận hành đầy đủ.','neutral','verified',array[]::text[]),
  ('ht-tacdong','body',1,'Em nói thẳng điều kiện đi kèm: luận điểm thời điểm chỉ đúng nếu các mốc hạ tầng không trượt dài — nên theo dõi sát từng cột mốc.','story','verified',array[]::text[]),

  -- THỊ TRƯỜNG / ĐẦU TƯ
  ('tt-hcm','hook',1,'Giá sơ cấp căn hộ TP.HCM tăng ~8% so 2024 (Savills); khu Đông dẫn dắt — [TEN_DU_AN] bán đúng vùng giá cao cấp, không phải ngoại lệ đắt.','neutral','verified',array[]::text[]),
  ('tt-hcm','body',1,'Phân khúc cao cấp/hạng sang dẫn dắt nguồn cung mới, hấp thụ ~91%. Nhưng mặt bằng chung đã cao — biên an toàn mỏng hơn chu kỳ trước.','story','verified',array[]::text[]),
  -- yield (RISK honest-advisor)
  ('tt-yield','hook',1,'Em nói thật con số ít môi giới nhắc: Savills cho biết tỷ suất cho thuê căn hộ TP.HCM hiện chỉ ~2%/năm, giảm mạnh so 5–6% trước 2023.','story','verified',array[]::text[]),
  ('tt-yield','hook',2,'Lợi nhuận ở [TEN_DU_AN] kỳ vọng đến chủ yếu từ tăng giá vốn, không phải dòng tiền thuê — phải xác định đúng ngay từ đầu.','story','verified',array[]::text[]),
  ('tt-yield','body',1,'Yield ~2% không đủ trả lãi vay thả nổi ~8–9,5% — đòn bẩy 70% chỉ an toàn khi có nguồn trả nợ độc lập. Em luôn tính kỹ điều này với khách.','neutral','verified',array[]::text[]),
  -- benchmark Thảo Điền
  ('tt-benchmark','hook',1,'Masteri Thảo Điền mở ~27–35 triệu/m² (2014–2015), nay thứ cấp ~100 triệu/m² — case minh chứng mạnh nhất khi khách hỏi Masteri có giữ giá không.','story','verified',array[]::text[]),
  ('tt-benchmark','body',1,'Dùng có trách nhiệm: biên độ đó thuộc chu kỳ giá đặc biệt 2014–2024. Kịch bản hợp lý cho [TEN_DU_AN] là tăng theo nhịp hạ tầng + lạm phát + premium hàng hiệu.','story','verified',array[]::text[]),
  -- thesis
  ('dt-thesis','hook',1,'Luận điểm đầu tư [TEN_DU_AN] đứng trên 4 trụ: vị trí khan hiếm, thương hiệu & thiết kế, đòn bẩy hạ tầng đúng nhịp, tiện ích hiện hữu.','neutral','verified',array[]::text[]),
  ('dt-thesis','hook',2,'Quỹ đất sạch 117 ha cuối cùng tại lõi khu Đông, kẹp giữa Thảo Điền – Thủ Thiêm — luận điểm vị trí khó bác.','story','verified',array[]::text[]),
  ('dt-thesis','body',1,'Thesis đứng vững khi: hạ tầng không trượt dài, CĐT giữ tiến độ, thị trường cao cấp không gãy thanh khoản — ba điều kiện cần theo dõi.','neutral','verified',array[]::text[]),
  ('dt-thesis','body',2,'Cụm chất xúc tác 2026–2028 trùng chu kỳ bàn giao Park Place/Cosmo — đòn bẩy hạ tầng đúng nhịp là trụ cột dễ kiểm chứng nhất.','neutral','verified',array[]::text[]),
  -- dòng tiền (RISK honest-advisor)
  ('dt-dongtien','hook',1,'Vách đá dòng tiền cần biết: với phương án vay 70%, từ 11/2028 hết hỗ trợ lãi suất, người mua bắt đầu chịu lãi thả nổi ~8–9,5%.','story','verified',array[]::text[]),
  ('dt-dongtien','body',1,'Giai đoạn xây dựng đến bàn giao: ngân hàng giải ngân, lãi suất 0% — gánh nặng gần như bằng 0. Sức ép tài chính dồn về sau ưu đãi.','neutral','verified',array[]::text[]),
  ('dt-dongtien','body',2,'Em luôn dựng bảng dòng tiền theo từng mốc cho khách: vào tiền bao nhiêu, khi nào bắt đầu chịu lãi, kế hoạch thoát trước vách đá lãi suất.','story','verified',array[]::text[]),
  -- rủi ro (RISK honest-advisor)
  ('dt-ruiro','hook',1,'Tư vấn trung thực là lợi thế: em đưa nguyên bản đồ rủi ro — pháp nhân CĐT, tiến độ hạ tầng, thanh khoản, lãi suất, nguồn cung.','story','verified',array[]::text[]),
  ('dt-ruiro','hook',2,'Rủi ro lớn nhất không phải dự án ảo — pháp lý [TEN_DU_AN] rất thật — mà là trả giá cao khi yield thấp và lãi vay chờ phía sau.','story','verified',array[]::text[]),
  ('dt-ruiro','body',1,'Pháp nhân SDI (lỗ/nợ/trái phiếu) và tiến độ hạ tầng có thể trượt 6–12 tháng là hai rủi ro cần quản trị bằng checklist và kế hoạch tài chính.','neutral','verified',array[]::text[]),
  ('dt-ruiro','body',2,'Giảm thiểu: chọn căn có câu chuyện riêng (view kênh/sông, tầng đẹp), giữ gói hỗ trợ lãi suất, có nguồn trả nợ độc lập với tiền thuê.','story','verified',array[]::text[]),
  -- khuyến nghị
  ('dt-khuyennghi','hook',1,'Trong đại đô thị nguồn cung lớn, căn có câu chuyện riêng (view nhạc nước, tầng đẹp, layout hiếm) là thứ bảo vệ giá khi thị trường chững.','story','verified',array[]::text[]),
  ('dt-khuyennghi','body',1,'Tăng giá vốn trung hạn 2–4 năm: ưu tiên Park Place view kênh/sông, giữ gói hỗ trợ lãi suất; tối ưu chính sách: Cosmo chiết khấu sâu.','neutral','verified',array[]::text[]),
  ('dt-khuyennghi','body',2,'Ba mốc nên theo dõi để ra quyết định: An Phú thông xe, Vành đai 3 thông xe thật, Lotte Mall chốt ngày khai trương. Em báo Anh/Chị từng mốc.','story','verified',array[]::text[]),

  -- IMPORTED HIGH-VALUE
  ('empire-city','hook',1,'Đối thủ lõi Thủ Thiêm — Empire City (landmark 88 tầng) giá ~110–200 triệu/m². Mốc để định vị [TEN_DU_AN] (~120–170).','neutral','verified',array['Giá (6/2026)']),
  ('empire-city','body',1,'Empire City do liên doanh Keppel đồng phát triển — cũng là chủ Saigon Sports City sát [TEN_DU_AN]. Cùng tay chơi lớn quanh vùng.','neutral','verified',array['Chủ đầu tư']),
  ('empire-city','proof',1,'14,5 ha, ~3.787 căn, vốn ~1,2 tỷ USD, đã bàn giao 2019–2022 — đối chiếu để khách thấy mặt bằng giá lõi Thủ Thiêm.','neutral','verified',array['Quy mô','Tổng vốn','Bàn giao']),
  ('tp-thu-duc','hook',1,'[TEN_DU_AN] nằm trong cực tăng trưởng TP Thủ Đức — vùng tạo ~30% GDP TP.HCM, định hướng trung tâm tài chính quốc gia.','neutral','verified',array['Đóng góp kinh tế','Định hướng']),
  ('tp-thu-duc','hook',2,'Dân số Thủ Đức dự kiến ~1,8 triệu (2030) → ~3 triệu (sau 2040) — nền cầu ở thực và thuê dài hạn cho khu Đông.','neutral','verified',array['Dân số']),
  ('tp-thu-duc','body',1,'Quy hoạch >21.100 ha, 9 phân vùng phát triển, đô thị sáng tạo tương tác cao — câu chuyện vĩ mô đỡ giá dài hạn.','neutral','verified',array['Quy mô','Định hướng']),
  ('tp-thu-duc','proof',1,'~30% GDP TP.HCM (~4–5% GDP cả nước) từ một vùng ~10% diện tích — đây là dữ kiện vĩ mô mạnh hơn mọi quảng cáo nội khu.','neutral','verified',array['Đóng góp kinh tế']),
  ('ifc-thu-thiem','hook',1,'Trung tâm tài chính quốc tế Thủ Thiêm đang hình thành ngay cạnh — lực kéo giá trị dài hạn cho cả khu Đông và [TEN_DU_AN].','neutral','verified',array['Mô hình']),
  ('ifc-thu-thiem','body',1,'Thủ Thiêm được quy hoạch thành trung tâm tài chính – thương mại – văn hóa tầm khu vực; [TEN_DU_AN] hưởng spillover khi CBD này vận hành.','neutral','verified',array['Lộ trình'])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b002' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch C: sự kiện · đối tác · megaproject · chính sách · thương hiệu ───────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('atvcg','hook',1,'50.000 người đổ về [TEN_DU_AN] trong một đêm concert ATVCG — sức hút khu đô thị mà tiền không mua được.','story','verified',array['Quy mô']),
  ('atvcg','hook',2,'Concert ATVCG chặng cuối 6–7/9/2025 tại [TEN_DU_AN] — từ 20.000 lên hơn 50.000 người/đêm.','neutral','verified',array['Thời gian','Quy mô']),
  ('atvcg','body',1,'Sự kiện tầm cỡ kéo cả thành phố về dự án — cư dân các phân khu sống ngay tại điểm đến giải trí đó.','story','verified',array[]::text[]),
  ('soobin-concert','hook',1,'SOOBIN — All-Rounder The Final tổ chức tại [TEN_DU_AN] ngày 29/11/2025.','neutral','verified',array['Thời gian','Tên']),
  ('soobin-concert','hook',2,'[TEN_DU_AN] là nơi diễn ra concert của các nghệ sĩ hàng đầu — một đô thị có nhịp sống thật, không phải nơi để ngủ.','story','verified',array[]::text[]),
  ('quoc-thien','hook',1,'Quốc Thiên SKYNote 2025: The Reflection diễn ra tại [TEN_DU_AN] ngày 22/11/2025.','neutral','verified',array['Thời gian','Tên']),
  ('pink-run','hook',1,'Pink Run / Nón Hồng 25/10/2025 — hơn 5.000 runner về [TEN_DU_AN].','neutral','verified',array['Thời gian','Quy mô']),
  ('pink-run','body',1,'Giải chạy cộng đồng quy mô lớn cho thấy hạ tầng tiện ích thể thao của [TEN_DU_AN] đã vận hành thật.','story','verified',array[]::text[]),
  ('global-wishmas','hook',1,'Global Wishmas — chợ Giáng sinh châu Âu và diễu hành tại [TEN_DU_AN] (20, 21, 24/12/2025).','neutral','verified',array['Thời gian','Loại']),
  ('ppa-tour','hook',1,'Giải Pickleball quốc tế PPA Tour Asia tổ chức tại tổ hợp thể thao [TEN_DU_AN].','neutral','verified',array['Môn','Địa điểm']),
  ('daddy-cool','hook',1,'Daddy Cool Diner — không gian retro Mỹ thập niên 90, đón ~1.000+ khách/ngày tại [TEN_DU_AN].','neutral','verified',array['Loại','Mở cửa']),
  ('marriott','hook',1,'Masterise hợp tác Marriott & JW Marriott tại Grand Marina — chuẩn vận hành hàng hiệu cùng hệ DNA với [TEN_DU_AN].','neutral','verified',array['Hợp tác']),
  ('ritz-carlton','hook',1,'Ritz-Carlton (The Grand Hanoi) — một trong các thương hiệu hàng hiệu mà Masterise hợp tác phát triển.','neutral','verified',array['Hợp tác']),
  ('elie-saab','hook',1,'The Rivus by Elie Saab — lần đầu một nhà mốt Haute Couture làm bất động sản tại Việt Nam, do Masterise phát triển.','neutral','verified',array['Hợp tác']),
  ('watg','hook',1,'450.000 m² cây xanh và mặt nước [TEN_DU_AN] do WATG quy hoạch — top 3 hãng thiết kế hospitality thế giới.','neutral','verified',array['Vai trò','Vị thế']),
  ('watg','body',1,'Triết lý đối thoại với thiên nhiên ngay giữa lõi đô thị — quỹ xanh là tài sản sống còn, khó dự án nào sao chép.','story','verified',array[]::text[]),
  ('cau-phu-my-2','hook',1,'Masterise tự bỏ ~23.186 tỷ xây cầu Phú Mỹ 2 — dây văng 2 tầng đầu tiên TP.HCM. CĐT làm được hạ tầng quốc gia thì bàn giao một dự án căn hộ là chuyện trong tầm tay.','story','verified',array['Tổng đầu tư','Quy mô']),
  ('cau-phu-my-2','body',1,'Cầu Phú Mỹ 2 (8 làn, 6,3 km) kết nối Nguyễn Hữu Thọ với đường liên cảng Đồng Nai, khởi công 15/1/2026.','neutral','verified',array['Quy mô','Kết nối','Khởi công']),
  ('cau-can-gio','hook',1,'Cầu Cần Giờ ~13.200 tỷ (dây văng vượt sông Soài Rạp) khởi công 15/1/2026 — cùng nhà đầu tư Masterise.','neutral','verified',array['Tổng đầu tư','Khởi công']),
  ('cau-can-gio','body',1,'Thay thế phà Bình Khánh, hoàn thành dự kiến 30/6/2029 — một trong ba megaproject hạ tầng Masterise đang triển khai.','neutral','verified',array['Thay thế','Hoàn thành']),
  ('gia-binh-airport','hook',1,'Quốc hội giao Masterise đầu tư siêu sân bay Gia Bình ~196.000 tỷ (NQ 256/2025/QH15) — cấp tín nhiệm cao nhất một doanh nghiệp tư nhân có thể đạt được.','story','verified',array['Tổng đầu tư','Phê duyệt']),
  ('gia-binh-airport','body',1,'Quy mô ~1.960 ha, ICAO 4F, công suất 30 triệu khách (2030) lên 50 triệu (2050) — tầm vóc tập đoàn đứng sau [TEN_DU_AN].','neutral','verified',array['Quy mô','Công suất 2030','Công suất 2050']),
  ('masterise-he','hook',1,'Chính đội Hospitality & Entertainment của Masterise tạo ra ATVCG, SOOBIN, Global Wishmas — biến [TEN_DU_AN] thành nơi cả Sài Gòn đổ về.','story','verified',array['Vai trò']),
  ('masterise-pm','hook',1,'Cùng đơn vị đang vận hành Grand Marina sẽ quản lý [TEN_DU_AN] — chuẩn dịch vụ không đổi.','neutral','verified',array['Vai trò','Áp dụng']),
  ('cs-mpp','hook',1,'Masteri Park Place: hỗ trợ lãi suất 0% đến 31/10/2028, 3 phương án thanh toán, ưu đãi early bird — đòn bẩy mạnh cho người mua đúng nhịp.','neutral','verified',array[]::text[]),
  ('cs-mpp','body',1,'Cấu trúc thanh toán giãn theo tiến độ, gánh nặng tài chính nhẹ tới sau bàn giao — em dựng bảng dòng tiền chi tiết cho từng căn.','story','verified',array[]::text[]),
  ('cs-cosmo','hook',1,'Cosmo Central: BIDV vay 70%, hỗ trợ lãi suất 0% đến 28/3/2029, chiết khấu tới ~14,5% — chính sách dày nhất hệ [TEN_DU_AN] hiện tại.','fomo','verified',array[]::text[]),
  ('cs-cosmo','body',1,'So với Park Place, Cosmo ưu đãi tài chính sâu hơn, đổi lại vị trí sát phố SOHO — em tư vấn chọn theo mục tiêu của Anh/Chị.','story','verified',array[]::text[]),
  ('cs-mgv','hook',1,'Chính sách MGV cho thấy khẩu vị Masterise: mở bán chiết khấu sâu, cận bàn giao siết lại — vào sớm thường nhận cấu trúc ưu đãi tốt nhất.','neutral','verified',array[]::text[]),
  ('cs-sola','hook',1,'SOLA vay 70%, hỗ trợ lãi suất đến 30/6/2027. Em nói rõ: với căn 47–200 tỷ, đòn bẩy lớn tạo nghĩa vụ nợ đáng kể — phân khúc này hợp vốn tự có cao.','story','verified',array[]::text[]),
  ('branded-residences','hook',1,'Masterise làm căn hộ hàng hiệu Marriott, Ritz-Carlton, Elie Saab — chuẩn hoàn thiện đó nằm cùng hệ DNA với [TEN_DU_AN].','neutral','verified',array['Số dự án','Gồm']),
  ('grand-marina','hook',1,'Grand Marina (Ba Son, Quận 1) — cụm Marriott & JW Marriott lớn nhất thế giới, đỉnh tháp thương hiệu Masterise.','neutral','verified',array['Vị trí','Thương hiệu']),
  ('grand-marina','body',1,'Marriott Lake tower đã khai trương 14/11/2023 — năng lực bàn giao branded residences của Masterise được chứng minh thật.','neutral','verified',array['Mốc']),
  ('masteri-collection','hook',1,'Masteri Collection — 15 dự án, ~27.200 căn, triết lý đô thị vị nhân sinh; Cosmo Central là phiên bản mới nhất tại [TEN_DU_AN].','neutral','verified',array['Số dự án','Số căn','Cosmo Central']),
  ('the-rivus','hook',1,'The Rivus by Elie Saab — 121 dinh thự duy nhất Việt Nam, giải Best Residential Design in Asia 2025.','neutral','verified',array['Quy mô','Giải']),
  ('the-grand-hanoi','hook',1,'The Grand Hanoi (22–24 Hàng Bài) — Ritz-Carlton thứ 5 châu Á – Thái Bình Dương, thuộc danh mục Masterise.','neutral','verified',array['Vị trí','Thương hiệu'])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b002' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch D: tiện ích phụ · cluster thể thao · so sánh · infra · vĩ mô · pháp lý
-- Hoàn tất phủ 100% (93/93 node). Honest-advisor cho caotoc/metro/tcb/benhvien/future.
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('ti-citypark','hook',1,'City Park (có đường đua Go-Kart) đã mở cửa 30/3/2024 — tầng tiện ích đời sống cuối tuần của [TEN_DU_AN] vận hành thật.','story','verified',array[]::text[]),
  ('ti-citypark','body',1,'Cùng kênh nhạc nước, City Park giúp dự án có nhịp sống thật trước khi cư dân cao tầng dọn về — điều các đại đô thị vùng ven thường thiếu 3–5 năm đầu.','neutral','verified',array[]::text[]),
  ('ti-mpp30','hook',1,'Hệ 30+ tiện ích Masteri Park Place: công viên ven sông, bể bơi resort, gym, yoga, thư viện, sảnh đón chuẩn khách sạn.','neutral','verified',array[]::text[]),
  ('ti-mpp30','body',1,'Bàn giao theo bộ chuẩn Masteri Collection (thiết bị thương hiệu) — đồng nhất chuỗi Masteri, giảm chi phí hoàn thiện cho người mua cho thuê.','neutral','verified',array[]::text[]),
  ('ti-vanphong','hook',1,'Tháp văn phòng hạng A + Convention Center + Lifestyle Hub ngay nội khu [TEN_DU_AN] — nguồn cầu thuê căn hộ bền nhất là người làm việc tại chỗ.','neutral','verified',array[]::text[]),
  ('ti-vanphong','body',1,'Văn phòng hạng A vận hành = tệp khách thuê chuyên gia/quản lý ngay nội khu, giảm phụ thuộc tệp thuê từ Quận 1/Thảo Điền.','neutral','verified',array[]::text[]),
  ('ti-benhvien','hook',1,'Quy hoạch bệnh viện tiêu chuẩn quốc tế ~2 ha trong [TEN_DU_AN]. Em nói rõ: chưa công bố đơn vị vận hành — nói "quy hoạch có bệnh viện", không hứa thương hiệu.','story','verified',array[]::text[]),
  ('pk-future','hook',1,'The Peak, Midtown là các cụm tháp tương lai theo nguồn thị trường — chưa có công bố chính thức từ CĐT, em chỉ dùng làm tham chiếu tổng nguồn cung.','story','verified',array[]::text[]),
  ('pk-future','body',1,'Nguồn cung tương lai lớn có thể pha loãng tăng giá ngắn hạn các tháp hiện hữu, nhưng kéo dài vòng đời marketing và mật độ cư dân — tốt cho khai thác.','neutral','verified',array[]::text[]),
  ('rach-chiec','hook',1,'Khu liên hợp TDTT Quốc gia Rạch Chiếc 186,78 ha (~6 tỷ USD), sân vận động 65.000–75.000 chỗ, khởi công 15/1/2026 — biểu tượng quốc gia sát [TEN_DU_AN].','neutral','verified',array['Quy mô','Vốn','Sân vận động','Khởi công']),
  ('rach-chiec','body',1,'[TEN_DU_AN] nằm trong cụm đô thị – thể thao cùng Rạch Chiếc và Saigon Sports City — cư dân có cả tổ hợp thể thao quốc gia trong bán kính gần.','story','verified',array['Tầm nhìn']),
  ('saigon-sports-city','hook',1,'Saigon Sports City 64 ha (Keppel) — mắt xích giữa Rạch Chiếc và [TEN_DU_AN] trong cụm đô thị – thể thao 368 ha.','neutral','verified',array['Quy mô']),
  ('saigon-sports-city','body',1,'Keppel đã chuyển nhượng 70% vốn (2025), giữ 30% — hiệu ứng cụm nhiều CĐT lớn cùng đầu tư vào một vùng làm tăng tốc lên đời cả khu.','neutral','verified',array['Ghi chú']),
  ('metropole-tt','hook',1,'Metropole Thủ Thiêm (SonKim) — trần giá hạng sang, 2PN tới ~300–440 triệu/m². Mốc để định vị [TEN_DU_AN] (~120–170).','neutral','verified',array['Giá tham khảo','Chủ đầu tư']),
  ('the-river-tt','hook',1,'The River Thủ Thiêm (Refico) — căn hộ hàng hiệu ven sông, cùng cụm nguồn cung hạng sang Thủ Thiêm.','neutral','verified',array['Chủ đầu tư','Đặc điểm']),
  ('tt-eaton','hook',1,'Eaton Park (Gamuda) ~115+ triệu/m², gần lõi Thủ Thiêm — nhưng là dự án đơn lẻ, thiếu hệ tiện ích đại đô thị (mall, trường, kênh) như [TEN_DU_AN].','neutral','verified',array['Giá','Vị trí']),
  ('tt-eaton','body',1,'Em so sánh thẳng: [TEN_DU_AN] thắng ở hệ sinh thái tự chủ; Eaton thắng ở khoảng cách tới Thủ Thiêm. Tùy ưu tiên của Anh/Chị.','story','verified',array['Chủ đầu tư']),
  ('zeit-river-tt','hook',1,'Zeit River (GS E&C, Hàn Quốc) đang bàn giao tại Thủ Thiêm — nguồn cung hạng sang hiện hữu, cạnh tranh tệp khách cao cấp với [TEN_DU_AN].','neutral','verified',array['Chủ đầu tư','Tiến độ']),
  ('tt-thuthiem','hook',1,'Thủ Thiêm là trần giá khu Đông (300–440 triệu/m²) — khoảng cách với [TEN_DU_AN] (~120–170) là dư địa kể chuyện nếu khu Đông tiếp tục lên hạng.','story','verified',array[]::text[]),
  ('tt-thuthiem','body',1,'Đồng thời đây cũng là lời nhắc trung thực: [TEN_DU_AN] chưa phải lõi CBD ven sông Quận 1 — định giá theo đúng vị thế của nó.','story','verified',array[]::text[]),
  ('tt-vgp','hook',1,'Vinhomes Grand Park không phải đối thủ giá mà là điểm so sánh giá trị — chứng minh mô hình đại đô thị tự vận hành làm tăng giá và giữ thanh khoản.','story','verified',array[]::text[]),
  ('tt-vgp','body',1,'VGP 45–65 triệu/m² hợp ngân sách 3–5 tỷ; khách 6 tỷ+ cần địa chỉ trung tâm mới thì [TEN_DU_AN] — hai phân khúc khác nhau.','neutral','verified',array[]::text[]),
  ('tt-giagc','hook',1,'Lịch sử giá [TEN_DU_AN]: SOHO → Grand View → Park Place, mặt bằng leo thang qua từng đợt mở bán — vào sớm thường có lợi thế giá.','story','verified',array[]::text[]),
  ('tt-giagc','body',1,'Em luôn nói rõ: giá rao thứ cấp (mức trần) gồm căn view đẹp tầng cao, mang tính niêm yết — không phải giá khớp, cần đối chiếu giao dịch thực.','story','verified',array[]::text[]),
  ('tt-thanhkhoan','hook',1,'Quy luật thanh khoản nội khu: căn hộ 1–2PN (6–10 tỷ) thoát hàng nhanh nhất; nhà phố và biệt thự siêu sang tệp hẹp hơn.','neutral','verified',array[]::text[]),
  ('tt-thanhkhoan','body',1,'Nhà đầu tư cần thanh khoản nên chọn căn hộ diện tích vừa, vị trí view đặc trưng (kênh/sông) để khác biệt khi bán lại.','story','verified',array[]::text[]),
  ('cdt-group','hook',1,'Masterise Group tăng vốn hơn 35.227 tỷ và lấn sân hàng không — tập đoàn mẹ quy mô lớn, đang mở rộng, đứng sau [TEN_DU_AN].','neutral','verified',array[]::text[]),
  ('cdt-group','body',1,'Em nhìn hai chiều: quy mô lớn là tín hiệu năng lực huy động vốn, nhưng cũng nghĩa là nguồn lực phân bổ cho nhiều mặt trận — cần theo dõi tiến độ.','story','verified',array[]::text[]),
  ('cdt-tcb','hook',1,'Trục Techcombank – Masterise giúp chính sách vay 70–80%, hỗ trợ lãi suất 0% vận hành trơn tru cho người mua [TEN_DU_AN].','neutral','verified',array[]::text[]),
  ('cdt-tcb','body',1,'Mặt còn lại em cũng nói thẳng: mức độ tập trung vào một hệ sinh thái là yếu tố cần cân nhắc với danh mục lớn.','story','verified',array[]::text[]),
  ('macro-vn','hook',1,'GDP Q1/2025 +6,93% (cao nhất từ 2020), FDI giải ngân 2025 ~27,62 tỷ USD (cao nhất 5 năm) — nền vĩ mô đỡ giá bất động sản cao cấp.','neutral','verified',array['GDP Q1/2025','FDI giải ngân 2025']),
  ('macro-vn','body',1,'Chứng khoán và vàng biến động, lãi suất hạ — dòng tiền tìm về bất động sản chuẩn quốc tế, lý do căn hộ cao cấp khu Đông hút vốn mạnh.','story','verified',array['Dòng tiền','GRDP HCM 2025']),
  ('thu-thiem-cbd','hook',1,'Thủ Thiêm đã chạm ngưỡng tỷ đồng/m² (biệt thự Sala) — [TEN_DU_AN] cách ~10 phút, giá căn hộ, đang ở vùng định giá hấp dẫn hơn nhiều so với CBD mới.','story','verified',array['Giá biệt thự Sala','Vai trò']),
  ('dt-kh','hook',1,'CĐT định vị khách Masteri Park Place là The Energized Strivers — thế hệ trẻ thành đạt, gia đình đa thế hệ, xem nhà là trạm tiếp năng lượng.','neutral','verified',array[]::text[]),
  ('dt-kh','body',1,'Ứng dụng tư vấn: chốt khách ở thật bằng trải nghiệm (view kênh, trường cho con); chốt nhà đầu tư bằng chính tệp khách thuê tương lai là nhóm này.','story','verified',array[]::text[]),
  ('dt-trigger','hook',1,'Tín hiệu MUA mạnh hơn: An Phú thông xe ~30/6/2026, Vành đai 3 thông xe, Lotte chốt ngày khai trương, Grand View bàn giao đúng hạn.','neutral','verified',array[]::text[]),
  ('dt-trigger','body',1,'Tín hiệu thận trọng: hạ tầng trượt hơn 6 tháng, giá thứ cấp đi ngang khi khu Đông bung hàng, chính sách hỗ trợ lãi suất bị rút ngắn. Em theo dõi giúp Anh/Chị.','story','verified',array[]::text[]),
  ('ht-lienphuong','hook',1,'Đường Liên Phường 60m chạy xuyên dự án — Masterise chi hơn 350 tỷ, thông xe kỹ thuật 8/11/2025 — đại lộ mặt tiền của mall và các tháp.','neutral','verified',array[]::text[]),
  ('ht-lienphuong','body',1,'Trục này mở hướng kết nối về Vành đai 3 và khu công nghệ cao — xương sống giao thông nội khu [TEN_DU_AN].','neutral','verified',array[]::text[]),
  ('ht-caotoc','hook',1,'Cao tốc Long Thành mở rộng lên 8–10 làn (2025–2027) — giải nút thắt tuyến huyết mạch nối [TEN_DU_AN] với sân bay Long Thành.','neutral','verified',array[]::text[]),
  ('ht-caotoc','body',1,'Em nói thật: giai đoạn mở rộng có thể gây ùn ứ cục bộ 2025–2027 trước khi thông thoáng — chuẩn bị tâm lý cho khách ở thật về trải nghiệm ngắn hạn.','story','verified',array[]::text[]),
  ('ht-metro','hook',1,'Trung thực khi tư vấn: [TEN_DU_AN] không nằm sát ga Metro số 1 — lợi thế metro là gián tiếp (nâng mặt bằng khu Đông), không phải tiện ích cửa nhà.','story','verified',array[]::text[]),
  ('metro-2-tham-luong','hook',1,'Metro số 2 (Bến Thành – Tham Lương) 11,3 km, 11 ga, khởi công 15/1/2026, vận hành Q4/2030 — trục xương sống kết nối trung tâm.','neutral','verified',array['Tuyến','Quy mô','Vận hành']),
  ('metro-2-thu-thiem','hook',1,'Metro 2 nhánh Bến Thành – Thủ Thiêm: 6 ga ngầm xuyên đáy sông Sài Gòn — [TEN_DU_AN] tiếp cận qua Ga Thủ Thiêm chỉ ~10 phút.','neutral','verified',array['Tuyến','Quy mô']),
  ('metro-2-thu-thiem','body',1,'Trục Tham Lương – Bến Thành – Thủ Thiêm – Long Thành trở thành xương sống metro, vận hành Q3/2030 — kết nối vùng cho khu Đông.','neutral','verified',array['Vận hành']),
  ('thu-thiem-long-thanh-rail','hook',1,'Đường sắt đô thị Thủ Thiêm – Long Thành (48 km, ~84.000 tỷ) — từ Ga Thủ Thiêm tới sân bay Long Thành chỉ 30 phút, vận hành 2030.','neutral','verified',array['Chiều dài','Kết nối','Vận hành']),
  ('vanh-dai-2','hook',1,'Vành đai 2 (đoạn 1+2+3, ~9 km) khởi công 19/12/2025, hoàn thành 2027 — khép kín đẩy xe tải khỏi trục trung tâm, nâng chất lượng sống quanh [TEN_DU_AN].','neutral','verified',array['Đoạn 1+2+3','Khởi công','Hoàn thành']),
  ('tq-rachchiec','hook',1,'[TEN_DU_AN] nằm trong cụm đô thị Rạch Chiếc gần 500 ha — hiệu ứng cụm nhiều CĐT lớn cùng đầu tư làm tăng tốc lên đời cả vùng.','neutral','verified',array[]::text[]),
  ('tq-rachchiec','body',1,'Cụm gồm Saigon Sports City (Keppel), KLH TDTT Rạch Chiếc và [TEN_DU_AN] — critical mass cho cả vùng giá trị, không phải dự án đơn độc.','story','verified',array[]::text[]),
  ('tq-sanpham','hook',1,'Cơ cấu [TEN_DU_AN]: ~1.800–2.392 sản phẩm thấp tầng + ~8.000–10.000 căn hộ cao tầng — một đại đô thị đa sản phẩm thực thụ.','neutral','verified',array[]::text[]),
  ('tq-sanpham','body',1,'Từ nhà phố SOHO (đã có sổ), biệt thự đảo SOLA, đến căn hộ Park Place/Cosmo/Grand View/Lumière — đủ dải sản phẩm cho mọi mục tiêu.','neutral','verified',array[]::text[]),
  ('pl-timeline','hook',1,'Điểm mạnh pháp lý cốt lõi: đất đã giao từ 2001, quy hoạch 1/500 phê duyệt 2015 — nền pháp lý gốc lâu đời hiếm có ở quỹ đất lõi khu Đông.','neutral','verified',array[]::text[]),
  ('pl-timeline','body',1,'Chuỗi pháp lý đầy đủ từ chủ trương đầu tư, giao đất đến quy hoạch chi tiết — khác hẳn các dự án vùng ven chỉ có chủ trương.','story','verified',array[]::text[]),
  ('pl-nganhang','hook',1,'Khi ký HĐMB, em luôn kiểm hai điều: chứng thư bảo lãnh nghĩa vụ tài chính của CĐT cho đúng căn, và căn đã giải chấp khỏi khoản vay dự án.','story','verified',array[]::text[]),
  ('pl-nganhang','body',1,'Techcombank/TCBS thu xếp vốn chủ đạo; BIDV hỗ trợ vay tới 70% tại Cosmo Central — nhiều lựa chọn ngân hàng cho người mua.','neutral','verified',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b002' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;
