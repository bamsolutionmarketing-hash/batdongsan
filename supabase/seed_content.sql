-- Starter assembly templates + draft content blocks (Gladia center node).
-- Draft set so the Assembly Engine produces real captions; admins refine/expand
-- via the Block Editor. Loaded after the knowledge seeds.

insert into assembly_templates (name, angle_match, structure, weight, is_enabled) values
  ('Tổng quát', array['project','developer','brand','group','cert'], '["hook","body","proof","cta"]'::jsonb, 2, true),
  ('Hạ tầng/Thị trường', array['infra','finance','metro','road'], '["hook","body","body","proof","cta"]'::jsonb, 1, true),
  ('So sánh/Vị trí', array['comparable','location','masterplan','amenity'], '["hook","proof","body","cta"]'::jsonb, 1, true)
on conflict do nothing;

insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled) values
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','hook',1,'🔥 [TEN_DU_AN] — cơ hội an cư ven sông hiếm có tại khu Đông TP.HCM.','fomo','verified','{}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','hook',2,'[TEN_DU_AN] — khu compound ba mặt giáp sông tại Bình Trưng Đông, TP Thủ Đức.','neutral','verified','{"Vị trí"}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','hook',3,'Sống chậm bên sông Sài Gòn, ngay trung tâm khu Đông — đó là tinh thần của [TEN_DU_AN].','story','verified','{}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','body',1,'Dự án đạt BCA Green Mark for Districts — chứng nhận quy hoạch khu đô thị đầu tiên tại Việt Nam từ Singapore.','neutral','verified','{"Chứng nhận"}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','body',2,'Mật độ xây dựng chỉ 23–38% — không gian sống thoáng, nhiều mảng xanh và mặt nước.','neutral','verified','{"Mật độ XD"}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','body',3,'Liên doanh Keppel (Singapore) × Khang Điền — pháp lý sạch, uy tín bảo chứng tiến độ bàn giao.','neutral','verified','{"Liên doanh"}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','proof',1,'Tổng vốn phát triển ~VND 10,200 tỷ trên 11.8 ha — quy mô đầu tư nghiêm túc, dài hạn.','neutral','verified','{"Tổng vốn","Diện tích"}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','cta',1,'👉 Liên hệ [TEN_SALE] – [SDT] để nhận bảng giá & chính sách mới nhất.','neutral','verified','{}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','cta',2,'Inbox [TEN_SALE] hoặc gọi [SDT] để giữ chỗ ưu tiên đợt đầu.','neutral','verified','{}',true)
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch 2: expanded variants for hot nodes ─────────────────────────────────
-- Gladia center top-up + green-mark / thạnh-mỹ-lợi / keppel-land (Gladia),
-- plus cosmo-central / the-global-city / liên-phường (Cosmo Central).
-- fact_keys reference only verified node facts (compliance gating stays sound).
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled) values
  -- Gladia center (3dcde88f) — top up
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','hook',4,'Khu Đông đang đổi vận — và [TEN_DU_AN] đứng ngay tâm điểm hạ tầng 2026–2027.','fomo','verified','{}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','hook',5,'Có những vị trí 10 năm mới xuất hiện một lần. [TEN_DU_AN] là một trong số đó.','story','verified','{}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','body',4,'Trần căn hộ ~3.05m theo chuẩn Singapore — không gian sống cao thoáng hiếm có.','neutral','verified','{"Trần"}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','body',5,'Sản phẩm ~200 căn thấp tầng + ~600 căn cao tầng — đa dạng lựa chọn an cư & đầu tư.','neutral','verified','{"Sản phẩm"}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','proof',2,'Liên doanh Keppel × Khang Điền trên 11.8 ha — pháp lý minh bạch, tiến độ bảo chứng.','neutral','verified','{"Liên doanh","Diện tích"}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','cta',3,'Để lại số hoặc nhắn [TEN_SALE] – [SDT], em gửi mặt bằng + chính sách trong hôm nay.','neutral','verified','{}',true),
  ('3dcde88f-fc3b-5011-9f09-f7d8960d0d46','cta',4,'Quỹ căn đẹp không nhiều — liên hệ [TEN_SALE] ([SDT]) để được giữ chỗ sớm.','neutral','verified','{}',true),
  -- green-mark-districts (5ed321a3)
  ('5ed321a3-4d82-55c4-b78f-e8013af00e22','hook',1,'Vì sao [TEN_DU_AN] khác biệt? Chứng nhận quy hoạch khu đô thị đầu tiên tại Việt Nam.','neutral','verified','{"Tại Việt Nam"}',true),
  ('5ed321a3-4d82-55c4-b78f-e8013af00e22','hook',2,'Không phải dự án nào cũng có "tem" Singapore cho cả khu đô thị — [TEN_DU_AN] có.','fomo','verified','{}',true),
  ('5ed321a3-4d82-55c4-b78f-e8013af00e22','hook',3,'Một tiêu chuẩn quy hoạch toàn cầu cho nơi an cư — đó là điểm bắt đầu của Gladia.','story','verified','{}',true),
  ('5ed321a3-4d82-55c4-b78f-e8013af00e22','body',1,'Green Mark for Districts đánh giá cả khu: giao thông, năng lượng, nước, vật liệu, môi trường.','neutral','verified','{"Phạm vi"}',true),
  ('5ed321a3-4d82-55c4-b78f-e8013af00e22','body',2,'Đây là chứng nhận cấp khu đô thị, không chỉ một tòa nhà — tiêu chuẩn sống toàn khu.','neutral','verified','{"Loại"}',true),
  ('5ed321a3-4d82-55c4-b78f-e8013af00e22','body',3,'Gladia là dự án ĐẦU TIÊN tại Việt Nam đạt chứng nhận này.','neutral','verified','{"Tại Việt Nam"}',true),
  ('5ed321a3-4d82-55c4-b78f-e8013af00e22','proof',1,'Chứng nhận cấp khu đô thị từ Singapore — lợi thế định vị không đối thủ nào trong khu vực có.','neutral','verified','{"Loại","Tại Việt Nam"}',true),
  -- thanh-my-loi (89b74583) — price story
  ('89b74583-594a-509e-b048-484a62e14dc0','hook',1,'Năm 2015 ai cũng nói Thạnh Mỹ Lợi xa, kẹt xe. Giờ đất mặt sông tới 400 triệu/m².','story','verified','{"Hiện tại (mặt sông)"}',true),
  ('89b74583-594a-509e-b048-484a62e14dc0','hook',2,'Bài học khu Đông: người ngại "xa" năm 2015 đã bỏ lỡ mức tăng 3–5 lần.','fomo','verified','{"Tăng"}',true),
  ('89b74583-594a-509e-b048-484a62e14dc0','hook',3,'Cùng một câu chuyện hạ tầng — Thạnh Mỹ Lợi đã chứng minh, khu Đông tiếp tục viết.','neutral','verified','{}',true),
  ('89b74583-594a-509e-b048-484a62e14dc0','body',1,'Đất biệt thự 2015 ~50–80 triệu/m², nay nội bộ 100–180 triệu/m².','neutral','verified','{"Đất biệt thự 2015","Hiện tại (nội bộ)"}',true),
  ('89b74583-594a-509e-b048-484a62e14dc0','body',2,'Mặt sông Trần Quý Kiên / Trương Văn Bang nay đạt ~400 triệu/m².','neutral','verified','{"Hiện tại (mặt sông)"}',true),
  ('89b74583-594a-509e-b048-484a62e14dc0','body',3,'Tăng 3–5 lần trong 10 năm — minh chứng cho lực hạ tầng khu Đông.','neutral','verified','{"Tăng"}',true),
  ('89b74583-594a-509e-b048-484a62e14dc0','proof',1,'Từ 50–80 lên 100–400 triệu/m² sau một thập kỷ — dữ liệu thị trường thực tế.','neutral','verified','{"Đất biệt thự 2015","Hiện tại (mặt sông)"}',true),
  -- keppel-land (3dc3fc74) — developer
  ('3dc3fc74-a162-5f0f-87a9-161954c8c052','hook',1,'Chủ đầu tư ngoại đầu tiên tại Việt Nam, 34 năm bền bỉ — đó là Keppel Land.','neutral','verified','{"Vào Việt Nam"}',true),
  ('3dc3fc74-a162-5f0f-87a9-161954c8c052','hook',2,'Không phải ai cũng trụ được 3 thập kỷ qua mọi chu kỳ thị trường — Keppel thì có.','fomo','verified','{"Vào Việt Nam"}',true),
  ('3dc3fc74-a162-5f0f-87a9-161954c8c052','hook',3,'Saigon Centre, Estella, Empire City... đứng sau đều là một cái tên: Keppel.','story','verified','{}',true),
  ('3dc3fc74-a162-5f0f-87a9-161954c8c052','body',1,'Keppel Land vào Việt Nam từ 1991, hơn 20 dự án, vốn đăng ký US$3.5 tỷ+.','neutral','verified','{"Vào Việt Nam","Dự án tại VN","Vốn đăng ký"}',true),
  ('3dc3fc74-a162-5f0f-87a9-161954c8c052','body',2,'Pipeline ~18,000 căn — năng lực phát triển dài hạn, không "đánh nhanh rút gọn".','neutral','verified','{"Pipeline"}',true),
  ('3dc3fc74-a162-5f0f-87a9-161954c8c052','body',3,'Nhân sự 600+ tại Việt Nam (so với 8 người năm 1991) — cam kết thị trường rõ ràng.','neutral','verified','{"Nhân sự"}',true),
  ('3dc3fc74-a162-5f0f-87a9-161954c8c052','proof',1,'Hơn 34 năm + US$3.5 tỷ vốn đăng ký tại Việt Nam — track record khó dự án nào sánh.','neutral','verified','{"Vào Việt Nam","Vốn đăng ký"}',true),
  -- cosmo-central (ab118257) — full set
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','hook',1,'[TEN_DU_AN] không bán một căn hộ — nó bán vị trí trái tim của The Global City.','story','verified','{}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','hook',2,'Lõi của khu đô thị 117 ha do Foster + Partners quy hoạch chỉ có một — và [TEN_DU_AN] đứng ở đó.','fomo','verified','{"Vị trí"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','hook',3,'Ra mắt 15/01/2026: [TEN_DU_AN] mở bán ngay tâm điểm The Global City.','neutral','verified','{"Ra mắt"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','hook',4,'Sở hữu lâu dài giữa lõi khu Đông — cơ hội không lặp lại nhiều lần.','fomo','verified','{"Sở hữu"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','hook',5,'Có người chọn nhà để ở. Có người chọn vị trí để cả thập kỷ sau vẫn đúng. [TEN_DU_AN].','story','verified','{}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','body',1,'Chủ đầu tư Masterise Homes — thương hiệu đứng sau loạt dự án hàng hiệu tại Việt Nam.','neutral','verified','{"Chủ đầu tư"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','body',2,'Quy mô 6 tháp 19–29 tầng trên 3 khối đế, 2 tầng hầm — quần thể khép kín.','neutral','verified','{"Quy mô"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','body',3,'Sản phẩm đa dạng từ 1PN tới 4PN, Penthouse và Duplex — phù hợp cả an cư lẫn đầu tư.','neutral','verified','{"Sản phẩm"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','body',4,'Sở hữu lâu dài cho khách quốc tịch Việt Nam — yên tâm pháp lý dài hạn.','neutral','verified','{"Sở hữu"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','body',5,'Bàn giao dự kiến Q3/2028 — lộ trình rõ ràng để lên kế hoạch tài chính.','neutral','verified','{"Bàn giao dự kiến"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','proof',1,'Nằm tại lõi The Global City — khu đô thị 117 ha do Foster + Partners quy hoạch.','neutral','verified','{"Vị trí"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','proof',2,'Masterise Homes phát triển, ra mắt 15/01/2026, bàn giao dự kiến Q3/2028.','neutral','verified','{"Chủ đầu tư","Ra mắt","Bàn giao dự kiến"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận bảng giá & mặt bằng [TEN_DU_AN] hôm nay.','neutral','verified','{}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','cta',2,'Quỹ căn đẹp tại lõi The Global City có hạn — liên hệ [TEN_SALE] ([SDT]) giữ chỗ.','neutral','verified','{}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','cta',3,'Trước giờ mở bán 15/01/2026, để lại số — [TEN_SALE] gửi chính sách ưu tiên sớm.','fomo','verified','{"Ra mắt"}',true),
  ('ab118257-cbe5-5b47-bf43-2b47153184ae','cta',4,'Cần tư vấn chọn căn theo ngân sách? Gọi [TEN_SALE] – [SDT].','neutral','verified','{}',true),
  -- the-global-city (d3220ba5)
  ('d3220ba5-7f03-5271-ac23-16969b080b07','hook',1,'The Global City: 117.4 ha do Foster + Partners quy hoạch — một thành phố thu nhỏ chuẩn quốc tế.','neutral','verified','{"Quy mô","Quy hoạch"}',true),
  ('d3220ba5-7f03-5271-ac23-16969b080b07','hook',2,'Cả TP.HCM chỉ có một khu đô thị do Foster + Partners quy hoạch — và nó ở khu Đông.','fomo','verified','{"Quy hoạch"}',true),
  ('d3220ba5-7f03-5271-ac23-16969b080b07','hook',3,'Khi một studio tầm cỡ Foster + Partners đặt bút, khu đất 117 ha thành một thành phố.','story','verified','{"Quy mô","Quy hoạch"}',true),
  ('d3220ba5-7f03-5271-ac23-16969b080b07','body',1,'Quy mô 117.4 ha do Masterise Homes phát triển — đại đô thị hiếm có giữa nội đô.','neutral','verified','{"Quy mô","Chủ đầu tư"}',true),
  ('d3220ba5-7f03-5271-ac23-16969b080b07','body',2,'Cảnh quan do WATG thiết kế với 450,000 m² mảng xanh và mặt nước.','neutral','verified','{"Cảnh quan"}',true),
  ('d3220ba5-7f03-5271-ac23-16969b080b07','body',3,'Quy hoạch bởi Foster + Partners (22/02/2022) — chuẩn thiết kế đẳng cấp toàn cầu.','neutral','verified','{"Quy hoạch"}',true),
  ('d3220ba5-7f03-5271-ac23-16969b080b07','proof',1,'117.4 ha, Foster + Partners quy hoạch, WATG cảnh quan — bộ ba hồ sơ đẳng cấp quốc tế.','neutral','verified','{"Quy mô","Quy hoạch","Cảnh quan"}',true),
  -- lien-phuong (e39eede8)
  ('e39eede8-8f14-53a1-9389-91752c72dee7','hook',1,'Đường Liên Phường đã thông xe 8/11/2025 — hạ tầng khu Đông không còn là lời hứa.','story','verified','{"Mốc"}',true),
  ('e39eede8-8f14-53a1-9389-91752c72dee7','hook',2,'Thảo Điền về The Global City rút ngắn rõ rệt khi Liên Phường thông toàn tuyến.','fomo','verified','{"Kết nối"}',true),
  ('e39eede8-8f14-53a1-9389-91752c72dee7','hook',3,'Trục 6.7 km nối Cát Lái – Mai Chí Thọ tới Vành đai 3 — Liên Phường mở mạch khu Đông.','neutral','verified','{"Chiều dài","Kết nối"}',true),
  ('e39eede8-8f14-53a1-9389-91752c72dee7','body',1,'Liên Phường dài ~6.7 km, đoạn qua The Global City rộng 60m lộ giới với 6 làn xe.','neutral','verified','{"Chiều dài","Đoạn TGC"}',true),
  ('e39eede8-8f14-53a1-9389-91752c72dee7','body',2,'Kết nối Cát Lái – Mai Chí Thọ thẳng tới Vành đai 3 — mạch giao thông xương sống khu Đông.','neutral','verified','{"Kết nối"}',true),
  ('e39eede8-8f14-53a1-9389-91752c72dee7','body',3,'Toàn tuyến kỹ thuật đã thông ngày 8/11/2025 — hạ tầng đã chạy thực tế.','neutral','verified','{"Mốc"}',true),
  ('e39eede8-8f14-53a1-9389-91752c72dee7','proof',1,'6.7 km, 6 làn, thông tuyến 8/11/2025 — hạ tầng hiện hữu, không phải quy hoạch trên giấy.','neutral','verified','{"Chiều dài","Đoạn TGC","Mốc"}',true)
on conflict (node_id, role, variant_no) do nothing;
