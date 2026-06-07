-- Bcons Center City (b005) — draft content blocks for the Assembly Engine.
-- Idempotent; node_id resolved by (project_id, node_key). Loads after
-- seed_knowledge_bcons.sql.
--
-- COMPLIANCE BY DESIGN: phân khúc vừa túi tiền với thế mạnh thật (hệ sinh thái
-- Bcons khép kín, TTTM 7 tầng, cụm tiện ích 74+135, Metro 1 hiện hữu) VÀ rủi ro
-- thật (chưa có văn bản đủ điều kiện bán, tranh chấp vận hành Bcons Garden 2026,
-- mật độ cụm cao, giá ~55tr/m² mới là rumor). Node rủi ro & giá dùng copy trung
-- thực (tone neutral/story, KHÔNG fomo); số chưa khoá để min_confidence thấp.
-- Placeholders: [TEN_DU_AN]=tên dự án · [TEN_SALE]=tên sale · [SDT]=điện thoại.

-- ── Batch A: hero · CĐT/hệ sinh thái · pháp lý ───────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  -- HERO: Bcons Center City (bcc)
  ('bcc','hook',1,'[TEN_DU_AN] không phải một block căn hộ đơn lẻ — đó là khu phức hợp All-in-One: ở, mua sắm, giải trí, học tập, làm việc trong cùng một cụm.','story','sales_claim',array['Định vị']),
  ('bcc','hook',2,'2 tháp thương mại 36 tầng (The Twin) + 3 tháp căn hộ — [TEN_DU_AN] mang dáng dấp một khu trung tâm thu nhỏ ngay cửa ngõ Đông TP.HCM.','neutral','sales_claim',array['Quy mô']),
  ('bcc','hook',3,'Sau sáp nhập 1/7/2025, [TEN_DU_AN] không còn là "căn hộ Bình Dương giáp ranh" — mà là căn hộ TP.HCM đúng nghĩa pháp lý, khu Dĩ An cũ.','neutral','verified',array['Vị trí']),
  ('bcc','hook',4,'Khởi công 28/6/2025, bàn giao dự kiến Q4/2027 — [TEN_DU_AN] đã lên hình ngay đối diện Bcons City đã có cư dân thật.','neutral','sales_claim',array['Khởi công','Bàn giao dự kiến']),
  ('bcc','body',1,'Quy mô ~3,2 ha với ~1.940 căn, gồm 2 tháp thương mại The Twin (36 tầng) và 3 tháp căn hộ Gateway – Icon – Crown (29 tầng).','neutral','sales_claim',array['Quỹ đất','Quy mô','Tổng căn hộ']),
  ('bcc','body',2,'Tên thương mại là [TEN_DU_AN]; tên pháp lý trên hồ sơ là Khu dân cư Bình An Đông Tây — em luôn ghi song song để Anh/Chị tự tra cứu được.','neutral','verified',array['Tên pháp lý']),
  ('bcc','body',3,'Chủ đầu tư là Công ty CP Địa ốc Bcons, thuộc hệ sinh thái Bcons khép kín quanh làng đại học — lợi thế kiểm soát chi phí, tiến độ và vận hành sau bàn giao.','neutral','sales_claim',array['Chủ đầu tư']),
  ('bcc','proof',1,'Định vị phức hợp căn hộ – TMDV – office – shophouse, kết nối Bcons City đối diện bằng cầu đi bộ qua đường Thống Nhất 32m — cụm tiện ích 74 + 135.','neutral','sales_claim',array['Định vị']),
  ('bcc','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận mặt bằng, bảng giá theo ngày hiệu lực & chính sách [TEN_DU_AN].','neutral','verified',array[]::text[]),
  ('bcc','cta',2,'Anh/Chị để lại số — [TEN_SALE] gửi ảnh tiến độ công trường và lịch tham quan nhà mẫu [TEN_DU_AN] (Zalo [SDT]).','neutral','verified',array[]::text[]),

  -- CĐT & hệ sinh thái
  ('dia-oc-bcons','hook',1,'Pháp nhân ký hợp đồng với Anh/Chị là Công ty CP Địa ốc Bcons — em luôn ghi đúng tên này trên mọi giấy tờ, Bcons Group là thương hiệu đứng sau.','neutral','verified',array['Pháp nhân']),
  ('dia-oc-bcons','body',1,'Tách rõ pháp nhân chủ đầu tư dự án và thương hiệu tập đoàn giúp Anh/Chị đọc hợp đồng và thẩm định chính xác, không nhầm lẫn.','story','verified',array[]::text[]),
  ('bcons-group','hook',1,'[TEN_DU_AN] thuộc hệ sinh thái Bcons khép kín: thiết kế – thi công – kinh doanh – vận hành – giáo dục, phát triển quanh làng đại học từ 2013.','neutral','sales_claim',array['Hệ sinh thái']),
  ('bcons-group','body',1,'Với phân khúc vừa túi tiền, lợi thế cốt lõi là kiểm soát chi phí, tiến độ và khả năng vận hành sau bàn giao bằng chính các công ty thành viên.','story','sales_claim',array[]::text[]),
  ('bcons-group','body',2,'Mục tiêu doanh thu tỷ USD hay kế hoạch IPO là tuyên bố của chủ đầu tư — em kể như câu chuyện tham vọng, không dùng làm cam kết.','neutral','unverified',array['Kế hoạch','Mục tiêu công bố']),
  ('ocb-banks','hook',1,'OCB là ngân hàng bảo lãnh công bố tại kick-off 2/12/2025; VCB, MB, ACB, TPBank, Public Bank, BIDV tham gia tài trợ vay [TEN_DU_AN].','neutral','sales_claim',array['Ngân hàng bảo lãnh','Ngân hàng tài trợ vay']),
  ('ocb-banks','body',1,'Phương thức thanh toán: theo tiến độ hoặc vốn tự có 50% + vay 50%. Em sẽ gửi chứng thư bảo lãnh khi ký HĐMB — đây là tài liệu Anh/Chị có quyền yêu cầu.','neutral','sales_claim',array['PTTT','Cần bổ sung']),

  -- Pháp lý
  ('legal-name','hook',1,'Khi tra pháp lý [TEN_DU_AN], hãy tìm theo tên pháp lý "Khu dân cư Bình An Đông Tây" — đó là cách kiểm tra một dự án có hồ sơ thật.','neutral','verified',array['Tên pháp lý']),
  ('legal-milestones','body',1,'Chuỗi văn bản 2024–2025 nối nhau liền mạch: chấp thuận chủ trương → quy hoạch 1/500 → GPXD → khởi công. Em gửi bản scan từng văn bản để Anh/Chị đối chiếu.','neutral','sales_claim',array['Chấp thuận chủ trương','Quy hoạch 1/500','Giấy phép xây dựng']),
  ('du-dk-ban','body',1,'Nói thẳng vì đây là quyền của Anh/Chị: hiện dự án nhận GIỮ CHỖ thiện chí (hoàn lại được) — HĐMB chỉ ký khi có văn bản đủ điều kiện bán của Sở Xây dựng (dự kiến 2026).','neutral','unverified',array['Giai đoạn hiện tại','Ký HĐMB dự kiến']),
  ('du-dk-ban','body',2,'Trước khi xuống tiền lớn, Anh/Chị nên yêu cầu xem văn bản đủ điều kiện bán nhà ở hình thành trong tương lai — em hỗ trợ chuẩn bị checklist này.','story','verified',array['Quyền của khách']),
  ('sap-nhap','hook',1,'Từ 1/7/2025, [TEN_DU_AN] thuộc phường Đông Hòa, TP.HCM — định vị nâng từ "vệ tinh Bình Dương" thành căn hộ nội đô TP.HCM.','neutral','verified',array['Hiệu lực','Phường mới']),
  ('sap-nhap','body',1,'Toàn bộ pháp lý gốc cấp dưới thời Bình Dương vẫn còn hiệu lực — chỉ cập nhật cách ghi địa chỉ trên hợp đồng, hóa đơn, sổ hồng.','neutral','verified',array['Hiệu lực hồ sơ cũ'])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b005' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch B: sản phẩm · tiện ích · hạ tầng/vị trí · so sánh · rủi ro ──────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  -- Sản phẩm
  ('master-5-thap','hook',1,'Cách nhớ [TEN_DU_AN] trong 1 câu: 2 tháp thương mại The Twin + 3 tháp căn hộ Gateway, Icon, Crown — tổng ~1.940 căn trên 3,2 ha.','neutral','sales_claim',array['Cấu trúc','Tổng căn']),
  ('the-twin','hook',1,'The Twin là điểm khác biệt của [TEN_DU_AN]: khối đế TTTM 7 tầng ~48.000m², rạp chiếu phim tầng 4–5, hồ bơi vô cực tầng 7.','story','sales_claim',array['Khối đế TTTM','Rạp chiếu phim','Hồ bơi vô cực']),
  ('the-twin','body',1,'Khi khách hỏi dự án hơn một chung cư thường ở điểm gì, em dẫn vào The Twin — cụm thương mại – giải trí làm nên chất "phức hợp".','story','sales_claim',array[]::text[]),
  ('the-gateway','hook',1,'The Gateway 812 căn, 29 tầng — câu chuyện hai hướng view: Đông Nam nhìn hồ Bình An & sông Đồng Nai, Tây Nam nhìn làng đại học & skyline Landmark 81.','story','sales_claim',array['Số căn','View Đông Nam','View Tây Nam']),
  ('the-gateway','body',1,'Hai căn cùng diện tích, hướng nhìn thường là lý do khách chọn — em tư vấn hướng theo tính cách: thiên nhiên mặt nước hay đô thị skyline.','story','sales_claim',array[]::text[]),
  ('co-cau-can','hook',1,'[TEN_DU_AN] có 1PN ~43,6–45,5m², 2PN ~52,5–59,2m², 3PN ~85,8m² — phủ từ người độc thân, cặp đôi tới gia đình nhỏ.','neutral','sales_claim',array['1PN','2PN','3PN']),
  ('co-cau-can','body',1,'Em luôn bắt đầu từ nhu cầu ở của Anh/Chị (ở thật hay cho thuê) rồi mới chọn tháp, tầng, view và chính sách — không bán ngược.','story','verified',array[]::text[]),
  ('gia-chinh-sach','body',1,'Nói rõ để Anh/Chị tính dòng tiền chính xác: con số "130–150 triệu" là thanh toán đợt đầu 5%, KHÔNG phải giá căn. Căn 2PN tham khảo ~2,9 tỷ đã gồm VAT.','neutral','sales_claim',array['Booking sales page','Căn 2PN tham khảo']),
  ('gia-chinh-sach','body',2,'Giá ~55 triệu/m² đang lan truyền là mức rumor/sales page, chưa phải bảng giá ký phát hành — em chỉ báo giá theo bảng có ngày hiệu lực.','neutral','unverified',array['Giá rumor','Quy tắc']),
  ('ban-giao','body',1,'Mốc bàn giao Q4/2027 luôn đi kèm chữ "dự kiến" — em cập nhật ảnh tiến độ công trường theo tháng để Anh/Chị thấy tiến triển thật, không chỉ lời hứa.','neutral','sales_claim',array['Bàn giao dự kiến']),

  -- Khai thác cho thuê
  ('cho-thue','hook',1,'Tham chiếu cho thuê thật ngay tại Bcons City đối diện: 2PN ~5,5–8,5 triệu/tháng, 1PN ~4,5–6,5 triệu — lợi suất gộp ước ~4–5%/năm.','neutral','sales_claim',array['Tham chiếu thuê Bcons City','Lợi suất gộp ước tính']),
  ('cho-thue','body',1,'Em phân tầng đúng tệp thuê: giảng viên, chuyên gia, nhân viên KCN và nhóm SV ở ghép — không nói "90.000 sinh viên đều là khách thuê căn hộ".','story','sales_claim',array['Tệp thuê thật']),

  -- Tiện ích
  ('tien-ich-74','hook',1,'74 tiện ích nội khu [TEN_DU_AN] + tiếp cận 135 tiện ích Bcons City qua cầu đi bộ — gom thành 4 cụm: mua sắm, giải trí, nghỉ dưỡng, giáo dục.','neutral','sales_claim',array['Bcons Center City','Bcons City đối diện']),
  ('rap-phim','hook',1,'Cuối tuần không cần rời khu — lên The Twin xem phim. Rạp chiếu phim tầng 4–5 là tiện ích lần đầu xuất hiện trong các dự án Bcons.','story','sales_claim',array['Vị trí','Điểm mới']),
  ('cau-di-bo','hook',1,'Cầu đi bộ qua đường Thống Nhất 32m là bằng chứng vật lý của hệ sinh thái: cư dân [TEN_DU_AN] không sống trong một dự án, mà trong một cụm Bcons.','story','sales_claim',array['Kết nối','Ý nghĩa']),

  -- Hạ tầng & vị trí
  ('metro-1','hook',1,'Metro số 1 Bến Thành – Suối Tiên đã chạy thật từ 22/12/2024 — ga Suối Tiên / Bến xe Miền Đông mới cách [TEN_DU_AN] vài phút BẰNG XE.','neutral','verified',array['Vận hành','Ga gần dự án']),
  ('metro-1','body',1,'Em nói chính xác: "vài phút bằng xe", không phải đi bộ — hạ tầng đã hiện hữu là điểm cộng thật, không cần thổi phồng.','neutral','verified',array[]::text[]),
  ('vanh-dai-3','hook',1,'Vành đai 3 (76,3 km) và nút giao Tân Vạn 3 tầng dự kiến thông xe kỹ thuật khoảng giữa 2026 — cú nâng kết nối vùng cho cửa ngõ Đông.','neutral','sales_claim',array['Toàn tuyến','Mốc gần dự án']),
  ('tan-van','body',1,'Chỗ kẹt xe ngại nhất ở Tân Vạn chính là nơi đang đổ gần 1.832 tỷ để gỡ — thi công gây kẹt tạm, nhưng sau 2026 là điểm cộng hạ tầng trực tiếp.','neutral','sales_claim',array['Gói thầu','Thông xe kỹ thuật']),
  ('thong-nhat','hook',1,'Đừng chỉ nói "gần Bcons City" — [TEN_DU_AN] kết nối bằng cầu đi bộ qua đường Thống Nhất 32m, trục xương sống của cụm Bcons.','neutral','sales_claim',array['Lộ giới']),
  ('dong-hoa','hook',1,'Cách nói an toàn & đúng: "Đông Hòa, TP.HCM — khu Dĩ An cũ" — chuẩn hành chính mới mà vẫn giữ nhận diện thị trường quen thuộc.','neutral','verified',array['Nhãn nên dùng']),
  ('lang-dai-hoc','hook',1,'ĐHQG TP.HCM hơn 90.000 sinh viên + KTX lớn nhất Việt Nam tạo nguồn cầu ở và cho thuê thật quanh [TEN_DU_AN].','neutral','sales_claim',array['Quy mô','KTX lớn nhất VN']),

  -- So sánh
  ('bcons-city','hook',1,'Benchmark tốt nhất của [TEN_DU_AN] là Bcons City đối diện: cùng CĐT, đã có cư dân thật, thứ cấp 2PN ~2,4–2,65 tỷ, thuê 5,5–8,5 triệu.','neutral','sales_claim',array['Thứ cấp 2PN','Giá thuê']),
  ('bcons-city','body',1,'Cùng cụm, kết nối bằng cầu đi bộ — Anh/Chị có thể qua xem trực tiếp cư dân, dịch vụ, giá thuê thật để tự định giá [TEN_DU_AN].','story','sales_claim',array[]::text[]),
  ('di-an-market','body',1,'Định vị giá: [TEN_DU_AN] (~55tr/m² rumor) nằm ở đỉnh dải giá Dĩ An cũ nhưng dưới mặt bằng Thủ Đức lân cận 65–75tr — câu chuyện "mua TP.HCM giá Dĩ An".','neutral','sales_claim',array['Center City rumor','CĐT so sánh']),
  ('phu-dong','body',1,'Khi khách so giá với Phú Đông SkyOne (rẻ hơn): khác biệt nằm ở sản phẩm — khu phức hợp 5 tháp + TTTM 7 tầng + cụm hệ sinh thái, so với dự án 2 block thuần ở.','neutral','sales_claim',array['Quy mô','Giá']),

  -- Rủi ro (disclaimer-first, neutral/story, KHÔNG fomo)
  ('risk-garden-2026','body',1,'Khi Anh/Chị Google "Bcons" sẽ gặp vụ Bcons Garden 2026 — bản chất là tranh chấp giữa cư dân và Ban Quản trị (do cư dân bầu) về quỹ bảo trì và hợp đồng vận hành, KHÔNG phải lỗi kết cấu xây dựng.','neutral','verified',array['Bản chất']),
  ('risk-garden-2026','body',2,'Bài học thật cho người mua: tham gia đầy đủ hội nghị nhà chung cư và yêu cầu minh bạch sao kê quỹ bảo trì ngay từ đầu — em không né vụ này.','story','verified',array[]::text[]),
  ('risk-booking','body',1,'Giai đoạn hiện tại nhận giữ chỗ là thỏa thuận dân sự, hoàn lại được — không phải HĐMB và không được mô tả như "đã mở bán chính thức".','neutral','unverified',array['Tính chất booking','Hành vi cấm']),
  ('risk-density','body',1,'Mật độ cụm Bcons quanh làng đại học cao là thật — đối trọng là hệ tiện ích cụm và hạ tầng 2026. Nếu Anh/Chị ưu tiên không gian thưa vắng, em nói thật đây chưa phải lựa chọn phù hợp.','story','sales_claim',array['Quy mô cụm','Mật độ XD Center City']),
  ('risk-pricing-comms','body',1,'Hai điểm em luôn đính chính trước: "130–150 triệu sở hữu" là thanh toán đợt đầu, không phải giá căn; "2 phút tới Metro" là vài phút bằng xe, không phải đi bộ.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b005' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;
