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

-- ── Batch C: bổ sung PROOF + CTA cho các node chủ lực ────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('dia-oc-bcons','proof',1,'Pháp nhân chủ đầu tư là Công ty CP Địa ốc Bcons, MST 0314704166 (GCN cấp 28/10/2017) — Anh/Chị tra cứu được trên cổng thông tin doanh nghiệp.','neutral','verified',array['Pháp nhân','MST']),
  ('legal-milestones','proof',1,'Trình tự 2024–2025: chấp thuận chủ trương 2/8/2024 → quy hoạch 1/500 ngày 6/12/2024 → GPXD 27/6/2025 → khởi công 28/6/2025 — chuỗi văn bản nối nhau trong chưa đầy một năm.','neutral','sales_claim',array['Chấp thuận chủ trương','Quy hoạch 1/500','Giấy phép xây dựng','Khởi công']),
  ('the-twin','proof',1,'Khối đế thương mại The Twin 7 tầng, tổng sàn ~48.000m² — quy mô thương mại hiếm có ở phân khúc tầm trung, kiểm chứng qua mặt bằng dự án.','neutral','sales_claim',array['Khối đế TTTM']),
  ('the-gateway','proof',1,'The Gateway 812 căn trên 29 tầng với layout 1–3PN — số liệu tháp đã công bố, em đối chiếu trực tiếp trên bảng hàng khi Anh/Chị chọn căn.','neutral','sales_claim',array['Số căn','Layout']),
  ('co-cau-can','proof',1,'Dải diện tích công bố chính thức: 1PN 43,6–45,5m², 2PN 52,5–59,2m², 3PN 85,8m² — phủ đủ nhu cầu từ độc thân tới gia đình nhỏ.','neutral','sales_claim',array['1PN','2PN','3PN']),
  ('metro-1','proof',1,'Metro số 1 dài 19,7km, 14 ga, vận hành thương mại từ 22/12/2024 — hạ tầng đã chạy thật, không phải quy hoạch trên giấy.','neutral','verified',array['Tuyến','Vận hành']),
  ('bcons-city','proof',1,'Bcons City đối diện đã bàn giao 4 tháp (10/2025), thứ cấp 2PN ~2,4–2,65 tỷ — bằng chứng sống về thanh khoản và giá của hệ Bcons ngay cạnh [TEN_DU_AN].','neutral','sales_claim',array['Bàn giao','Thứ cấp 2PN']),
  ('tien-ich-74','proof',1,'74 tiện ích nội khu + 135 tiện ích Bcons City liền kề — tổng cụm tiện ích kiểm chứng được khi Anh/Chị qua tham quan trực tiếp.','neutral','sales_claim',array['Bcons Center City','Bcons City đối diện']),
  ('gia-chinh-sach','cta',1,'Anh/Chị nhắn [TEN_SALE] – [SDT] để nhận bảng giá [TEN_DU_AN] mới nhất theo ngày hiệu lực (tháp, tầng, view, thông thủy/tim tường).','neutral','verified',array[]::text[]),
  ('the-gateway','cta',1,'Em gửi sơ đồ tầng The Gateway và tư vấn chọn hướng Đông Nam / Tây Nam theo nhu cầu — gọi [TEN_SALE] ([SDT]).','neutral','verified',array[]::text[]),
  ('cho-thue','cta',1,'Muốn xem bảng giá thuê thật của khu và bảng tính dòng tiền cho thuê? Nhắn [TEN_SALE] – [SDT].','neutral','verified',array[]::text[]),
  ('du-dk-ban','cta',1,'Em gửi checklist pháp lý cần kiểm tra trước khi cọc (gồm văn bản đủ điều kiện bán) — nhắn [TEN_SALE] ([SDT]) để nhận bản đầy đủ.','neutral','verified',array[]::text[]),
  ('bcons-city','cta',1,'Anh/Chị để lại số — [TEN_SALE] sắp lịch dẫn qua Bcons City đối diện xem cư dân, dịch vụ, giá thuê thật trước khi quyết [TEN_DU_AN] (Zalo [SDT]).','neutral','verified',array[]::text[]),
  ('co-cau-can','cta',1,'Gửi [TEN_SALE] – [SDT] nhu cầu (ở/cho thuê, số phòng, ngân sách) — em lọc nhanh layout [TEN_DU_AN] phù hợp nhất.','neutral','verified',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b005' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch D: phủ các node còn trống (CĐT phụ · sản phẩm · tiện ích · hạ tầng ──
--    · vị trí · so sánh · rủi ro · đào tạo) ───────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  -- Developer phụ
  ('le-nhu-thach','hook',1,'Người sáng lập Bcons là TS Lê Như Thạch — xuất thân kỹ sư xây dựng và giảng viên, gắn thương hiệu với câu chuyện làm nhà cho người trẻ quanh làng đại học.','story','sales_claim',array['Vai trò','Sinh năm']),
  ('le-nhu-thach','body',1,'Câu chuyện cá nhân là chất liệu thương hiệu mạnh — nhưng em luôn nhắc: phát ngôn của lãnh đạo không thay thế văn bản pháp lý của dự án.','neutral','verified',array[]::text[]),
  ('bcons-construction','hook',1,'Bcons Construction là đơn vị thi công lõi của hệ sinh thái — đồng thời là tổng thầu nhiều dự án Bcons đã bàn giao.','neutral','sales_claim',array['Vai trò']),
  ('bcons-construction','body',1,'Em không né điểm cần theo dõi: vốn điều lệ pháp nhân này biến động mạnh 2024–2025 kèm đổi tên — có thể là tái cơ cấu trước IPO. Khi Anh/Chị quan tâm năng lực tài chính, em chuyển trọng tâm về pháp nhân CĐT dự án và ngân hàng bảo lãnh.','story','unverified',array['Biến động vốn','Thay đổi tên']),
  ('bcons-members','hook',1,'Chuỗi công ty thành viên (Home – Service – Education – Invest – Tech) giúp Bcons khép kín từ bán hàng đến vận hành sau bàn giao.','neutral','sales_claim',array['Bcons Home','Bcons Service']),
  ('bcons-members','body',1,'Lưu ý minh bạch: Bcons Service là đơn vị vận hành liên quan vụ tranh chấp Bcons Garden 2026 — em nắm rõ để trả lời chủ động khi Anh/Chị hỏi.','neutral','verified',array['Bcons Service']),
  ('foreign-partners','hook',1,'Bcons có hợp tác đối tác Thái (A Asset/PPSN) và Nhật (Mercuria) ở cấp hệ sinh thái — tín hiệu vốn ngoại vào tập đoàn.','neutral','unverified',array['A Asset Limited','Mercuria']),
  ('foreign-partners','body',1,'Với riêng [TEN_DU_AN] chưa có công bố đối tác ngoại tham gia trực tiếp — em không suy diễn "vốn Nhật/Thái" cho dự án này khi chưa có văn bản.','neutral','unverified',array['Ý nghĩa']),
  ('legal-room','body',1,'Pháp lý là khu vực không được sáng tạo: có văn bản thì nói, chưa có thì ghi rõ "theo công bố chủ đầu tư" và hẹn gửi bản scan. Em làm việc theo data room dùng chung để tránh sai lệch.','neutral','verified',array['Quy tắc dùng','Văn bản cần có']),

  -- Sản phẩm còn trống
  ('the-icon','hook',1,'The Icon — tháp căn hộ 29 tầng, 549 căn trong cụm 3 tháp ở của [TEN_DU_AN].','neutral','sales_claim',array['Loại','Số căn']),
  ('the-icon','body',1,'Hướng view và layout chi tiết em cập nhật theo bảng hàng khi tháp mở bán — không nói trước số liệu chưa khoá.','neutral','unverified',array['Cần bổ sung']),
  ('the-crown','hook',1,'The Crown — tháp căn hộ 29 tầng, 579 căn; tên gọi định vị nhóm khách muốn cảm giác cao cấp hơn trong cùng dự án.','neutral','sales_claim',array['Loại','Số căn']),
  ('the-crown','body',1,'Mọi định vị "cao cấp hơn" chỉ chốt khi có bảng hàng và thông số thật — em bám dữ liệu, không bán bằng tên gọi.','neutral','unverified',array['Cần bổ sung']),
  ('ham-lech-tang','hook',1,'Tầng hầm lệch tầng là chi tiết kỹ thuật đáng giá: hầm B1 khu thương mại (4m) giao với hầm B2 khu căn hộ (3m) — tách dòng lưu thông thương mại và cư dân.','neutral','sales_claim',array['Cấu trúc','Chiều cao B1','Chiều cao B2']),
  ('ham-lech-tang','body',1,'Khi Anh/Chị hỏi về đậu xe và vận hành, cấu trúc hầm lệch tầng khác hẳn hầm phẳng thông thường — em giải thích bằng mặt bằng cụ thể.','neutral','sales_claim',array['Liên thông']),
  ('tttm-7-tang','hook',1,'TTTM 7 tầng ~48.000m² sàn ở khối đế The Twin biến [TEN_DU_AN] từ "căn hộ" thành "khu phức hợp" — mua sắm, F&B, giải trí, dịch vụ ngay dưới chân nhà.','story','sales_claim',array['Quy mô','Chức năng']),
  ('quang-truong','hook',1,'Công viên quảng trường tới 8.000m² với nhạc nước — không gian cộng đồng làm [TEN_DU_AN] có đời sống sau bàn giao, không chỉ đẹp trong phối cảnh.','story','sales_claim',array['Diện tích','Điểm nhấn']),
  ('ho-boi','hook',1,'Hai hồ bơi ở hai cao độ: hồ vô cực tầng 7 The Twin và hồ ốc đảo dưới mặt đất — câu chuyện lifestyle, không chỉ là một tiện ích.','story','sales_claim',array['Hồ bơi 1','Hồ bơi 2']),

  -- Hạ tầng còn trống
  ('bxmd','hook',1,'Bến xe Miền Đông mới là hub liên vùng khu Đông kết nối Metro số 1 — điểm trung chuyển quan trọng trong câu chuyện kết nối của [TEN_DU_AN].','neutral','sales_claim',array['Vai trò']),
  ('bxmd','body',1,'Các mốc "phút di chuyển" em đo theo tuyến thực tế giờ cao điểm/thấp điểm thay vì quote cố định — để Anh/Chị hình dung đúng.','neutral','unverified',array['Cần kiểm tra']),
  ('d11','hook',1,'D11 là đường tiếp cận trực tiếp [TEN_DU_AN]: hiện hữu 7m, quy hoạch mở rộng 17m — em phân biệt rõ hiện trạng hôm nay và quy hoạch ngày mai.','neutral','unverified',array['Hiện hữu','Quy hoạch mở rộng']),
  ('ql1k-xlhn','body',1,'Mạng trục QL1K/QL1A/Xa lộ Hà Nội quanh dự án cho kết nối đa hướng — nhưng kẹt giờ cao điểm là thật; kỳ vọng giảm tải khi Vành đai 3 và nút Tân Vạn thông xe 2026.','neutral','sales_claim',array['Các trục','Triển vọng']),

  -- Vị trí còn trống
  ('kcn-tien-ich','hook',1,'Vành đai việc làm quanh [TEN_DU_AN]: KCN Sóng Thần, Linh Trung, VSIP + thương mại GO!/Vincom Dĩ An + y tế Hoàn Mỹ — nền của cầu ở thật.','neutral','sales_claim',array['Khu công nghiệp','Thương mại','Y tế']),

  -- So sánh còn trống (trung thực, không dìm đối thủ)
  ('bcons-garden','body',1,'Bcons Garden (hơn 1.800 căn, đã bàn giao) đang có tranh chấp vận hành 2026 — em chủ động nói trước vì khách tra Google sẽ gặp; chi tiết và bản chất vụ việc em trình bày ở phần rủi ro.','neutral','verified',array['Quy mô','Vấn đề 2026']),
  ('bcons-others','hook',1,'Chuỗi dự án Bcons đã bàn giao quanh làng đại học (Suối Tiên, Miền Đông, Green View…) là bằng chứng năng lực triển khai liên tục ở phân khúc vừa túi tiền.','neutral','sales_claim',array['Bcons Suối Tiên','Bcons Miền Đông']),
  ('picity','body',1,'Picity Sky Park (~40–50tr/m², bàn giao Q4/2026) là đối thủ cùng dải giá sát nhất — em so sánh thẳng về vị trí tiếp cận, tiện ích khối đế và uy tín bàn giao để Anh/Chị tự cân.','neutral','sales_claim',array['Giá','Bàn giao']),
  ('tt-avio','body',1,'TT AVIO chơi bài "chuẩn Nhật + thanh toán nhẹ" (từ ~1,1 tỷ/căn) hút khách trẻ lần đầu mua nhà — khác biệt của [TEN_DU_AN] là quy mô phức hợp và hệ tiện ích cụm.','neutral','sales_claim',array['CĐT','Giá']),
  ('la-pura','body',1,'La Pura (Phát Đạt, ~6.000 căn, trục QL13) là nguồn cung lớn hút khách đầu tư diện rộng — dải giá 39,5–72,7tr/m² cho thấy mặt bằng "TP.HCM mới" đang định hình lại toàn khu.','neutral','sales_claim',array['Quy mô','Giá']),

  -- Rủi ro & đào tạo còn trống
  ('risk-data','body',1,'Em giữ kỷ luật dữ liệu: không quote số chưa khoá (giá, diện tích, phút di chuyển, pháp lý). Ví dụ số căn dao động 1.800–1.940 tùy tài liệu — em dùng nhất quán theo Q&A nội bộ.','neutral','unverified',array['Nguyên tắc','Số căn']),
  ('qa-10','body',1,'Bộ 10 câu Q&A chuẩn (tổng quan → kỹ thuật → view → tiện ích → tài chính → chủ đầu tư) là khung đào tạo nội bộ để mọi tư vấn trả lời nhất quán về [TEN_DU_AN].','neutral','sales_claim',array['Q1','Q10'])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b005' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;
