-- Bcons Ngôi Sao Hoàng Nam (b007) — draft content blocks for the Assembly Engine.
-- Idempotent; node_id resolved by (project_id, node_key). Loads after
-- seed_knowledge_bnshn.sql.
--
-- COMPLIANCE BY DESIGN: căn hộ vừa túi tiền với thế mạnh thật (CĐT Bcons uy tín
-- giao nhà "không trễ", dòng thuê thực ĐHQG + KCN, bám Metro/TOD, giá mềm) VÀ
-- rủi ro thật (mới động thổ 1/2026 nên pháp lý bán hàng/giá CHƯA công bố, mật độ
-- xây dựng cao ~51,66%, cạnh tranh dày, mâu thuẫn số liệu). Node giá/pháp lý/rủi
-- ro dùng copy trung thực (neutral/story, KHÔNG fomo); số chưa khoá để
-- min_confidence unverified.
-- Placeholders: [TEN_DU_AN]=tên dự án · [TEN_SALE]=tên sale · [SDT]=điện thoại.

-- ── Batch A: hero · tổng quan · CĐT ──────────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('bcons','hook',1,'[TEN_DU_AN] — căn hộ vừa túi tiền trên trục Thống Nhất, P. Đông Hòa (Dĩ An cũ), cạnh Làng Đại học & Metro số 1, do Bcons phát triển.','neutral','sales_claim',array['Vị trí','Phát triển']),
  ('bcons','hook',2,'Quy mô nhỏ gọn: 1 tháp 21 tầng, 372 căn 50–67 m² — cộng đồng tinh, hợp gia đình trẻ & khai thác cho thuê quanh ĐHQG/KCN.','neutral','sales_claim',array['Quy mô tháp','Số căn hộ']),
  ('bcons','hook',3,'Câu chuyện 3 dòng: CĐT Bcons "không bàn giao trễ" + vị trí dòng thuê thực + bám Metro/TOD — đón cú hích sáp nhập Bình Dương vào TP.HCM.','story','sales_claim',array[]::text[]),
  ('bcons','body',1,'Toàn khu 7.877,8 m², 1 tháp 21 tầng + 1 hầm, 372 căn (~1.274 cư dân), phát triển bởi Bcons Group × CTCP Đầu tư Dự án Hoàng Nam, tài trợ OCB.','neutral','sales_claim',array['Quy mô toàn khu','Số căn hộ','Phát triển','Tài trợ']),
  ('bcons','body',2,'Động thổ 24/01/2026, bàn giao dự kiến Q3/2028 — dự án mới khởi đầu, em luôn nói rõ giai đoạn để Anh/Chị tính dòng vốn và rủi ro đúng.','neutral','sales_claim',array['Động thổ','Bàn giao']),
  ('bcons','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận thông tin chính thức, chính sách giữ chỗ & bảng giá [TEN_DU_AN] khi mở bán.','neutral','verified',array[]::text[]),
  ('bcons','cta',2,'Anh/Chị để lại số — [TEN_SALE] cập nhật tiến độ pháp lý & thi công [TEN_DU_AN] (Zalo [SDT]).','neutral','verified',array[]::text[]),

  ('tq-vitri','hook',1,'[TEN_DU_AN] bám trục Thống Nhất (32m, 6 làn) nối Thủ Đức – Dĩ An ra Metro số 1, kề Làng Đại học và chuỗi dự án Bcons.','neutral','sales_claim',array[]::text[]),
  ('tq-vitri','body',1,'Kết nối Metro số 1, Bến xe Miền Đông mới, QL1K/QL1A, Phạm Văn Đồng, Vành đai 3; ~30–40 phút về Quận 1; gần KCN Sóng Thần, Linh Trung, VSIP.','neutral','sales_claim',array[]::text[]),
  ('tq-quymo','hook',1,'Dự án boutique: 7.877,8 m², 1 tháp 21 tầng, 372 căn — cộng đồng gọn, dễ quản lý vận hành.','neutral','sales_claim',array['Số căn','Số tháp']),
  ('tq-quymo','body',1,'Em nói thẳng hai mặt: quy mô nhỏ thì cộng đồng tinh & quản lý gọn, nhưng mật độ xây dựng ~51,66% nên không gian xanh & tiện ích lớn bị giới hạn.','story','sales_claim',array['Mật độ xây dựng']),
  ('tq-mauthuan','body',1,'Lưu ý chống nhiễu thông tin: nhiều trang ghi sai số liệu (3.680 m², 29 tầng) do nhầm với dự án Bcons khác. Số chính thức là 7.877,8 m², 21 tầng, 1 hầm — em luôn bám số CĐT công bố.','neutral','unverified',array[]::text[]),
  ('tq-thietke','hook',1,'Tháp căn hộ thiết kế đón nắng – gió tự nhiên, hướng "sống xanh – bền vững", vật liệu thân thiện môi trường (theo công bố lễ động thổ).','story','sales_claim',array[]::text[]),
  ('tq-dinhvi','body',1,'Định vị đúng: vừa túi tiền + thương hiệu quen + vị trí có dòng thuê thực — hướng gia đình trẻ, chuyên gia, người lao động khu Đông. Đây KHÔNG phải sản phẩm "siêu sang", em tư vấn đúng phân khúc.','story','sales_claim',array[]::text[]),
  ('tq-sapnhap','hook',1,'Từ 1/7/2025, [TEN_DU_AN] mang địa chỉ TP.HCM (phường Đông Hòa mới) — định vị nâng từ "căn hộ Bình Dương" thành căn hộ TP.HCM khu cửa ngõ Đông.','neutral','verified',array['Phường Đông Hòa mới']),

  ('cdt-bcons','hook',1,'CĐT [TEN_DU_AN] là Bcons Group (lập 2013) — nhà phát triển tầm trung ra hàng đều, chuyên căn hộ vừa túi tiền quanh làng đại học khu Đông.','neutral','sales_claim',array['Lõi năng lực']),
  ('cdt-bcons','body',1,'Lõi năng lực Bcons là tư vấn thiết kế + tổng thầu xây dựng + đầu tư BĐS — mạnh ở khâu thi công, kiểm soát tiến độ & chi phí, lợi thế cho phân khúc giá mềm.','neutral','sales_claim',array['Lõi năng lực','Quy mô']),
  ('cdt-trackrecord','hook',1,'Điểm mạnh lớn nhất của Bcons: uy tín giao nhà. Lãnh đạo khẳng định "chưa có dự án nào bàn giao trễ"; 8 dự án đã ra sổ hồng cho cư dân.','neutral','sales_claim',array[]::text[]),
  ('cdt-trackrecord','proof',1,'Bcons Plaza, Bee, Polygon, Suối Tiên, Miền Đông, Garden, Green View… đã bàn giao + ra sổ, cam kết sổ riêng ~6 tháng sau giao nhà — bằng chứng năng lực thực thi giảm rủi ro mua nhà hình thành trong tương lai.','neutral','sales_claim',array[]::text[]),
  ('cdt-danhmuc','body',1,'Chuỗi ~14+ dự án Bcons phần lớn tại Dĩ An (Đông Hòa, An Bình, Bình An) — hệ sinh thái dày đặc giúp khu vực có cộng đồng cư dân thật và thanh khoản tốt.','neutral','sales_claim',array[]::text[]),
  ('cdt-hoangnam','body',1,'Đối tác đồng phát triển là CTCP Đầu tư Dự án Hoàng Nam (ông Hoàng Văn Tâm, Chủ tịch). Vì là dự án hợp tác, em khuyên làm rõ pháp nhân ký HĐMB và trách nhiệm bàn giao/ra sổ.','neutral','sales_claim',array[]::text[]),
  ('cdt-tod','body',1,'Bcons theo mô hình TOD — phát triển đô thị bám tuyến Metro; mục tiêu lấp đầy >90% các dự án đã hoàn thành. Câu chuyện TOD hợp với tệp khách dùng giao thông công cộng quanh ĐHQG.','story','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b007' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch B: pháp lý · sản phẩm · tiện ích ───────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('pl-hientrang','body',1,'Nói thẳng: dự án mới động thổ 24/01/2026, đang giai đoạn đầu. CĐT nói "đã chuẩn bị kỹ pháp lý" nhưng CHƯA công bố công khai số 1/500, GPXD hay văn bản đủ điều kiện bán riêng dự án này — cần xác minh trước khi xuống tiền lớn.','neutral','unverified',array[]::text[]),
  ('pl-benchmark','body',1,'Bù lại, "lịch sử pháp lý" của Bcons là tham chiếu tích cực: Bcons City (cùng đường Thống Nhất) đã có văn bản đủ điều kiện bán 71/SXD-QLN (6/3/2025); 8 dự án Bcons đã ra sổ hồng.','neutral','sales_claim',array[]::text[]),
  ('pl-sohuu','body',1,'Là căn hộ chung cư để ở; thông lệ Bcons là sổ hồng sở hữu lâu dài cho người mua trong nước. Chi tiết (thời hạn, sở hữu chung/riêng, room nước ngoài) cần xác nhận trong HĐMB & GCN.','neutral','sales_claim',array[]::text[]),
  ('pl-ocb','body',1,'Ngân hàng OCB hiện diện tại lễ động thổ — nhiều khả năng là đơn vị tài trợ vốn dự án và/hoặc cho vay, bảo lãnh người mua. Em sẽ xác nhận chứng thư bảo lãnh khi ký HĐMB.','neutral','sales_claim',array[]::text[]),
  ('pl-checklist','body',1,'Vì dự án mới động thổ, Anh/Chị nên kiểm: chủ trương + 1/500, GPXD, văn bản đủ điều kiện bán; nếu CHƯA có thì chỉ "giữ chỗ" hoàn lại, không thanh toán lớn. Làm rõ pháp nhân ký HĐMB và chứng thư bảo lãnh OCB.','neutral','verified',array[]::text[]),
  ('pl-checklist','cta',1,'Em gửi checklist 6 bước thẩm định trước cọc cho dự án mới động thổ — nhắn [TEN_SALE] ([SDT]) để nhận.','neutral','verified',array[]::text[]),

  ('pk-cancho','hook',1,'372 căn diện tích 50–67 m² — đúng "khẩu vị" 1–2PN vừa túi tiền cho gia đình trẻ và khai thác cho thuê.','neutral','sales_claim',array['Tổng căn','Diện tích']),
  ('pk-loaihinh','body',1,'CĐT chưa công bố layout chi tiết. Theo dải 50–67 m² và dòng sản phẩm Bcons, cơ cấu dự kiến nghiêng 1PN (~50 m²) và 2PN (~58–67 m²) — em cập nhật chính xác khi có bảng hàng.','neutral','unverified',array[]::text[]),
  ('pk-bangiao','body',1,'Chuẩn bàn giao chưa công bố riêng; tham chiếu các dự án Bcons: sàn gạch/gỗ, trần thạch cao, tủ bếp trên–dưới, thiết bị vệ sinh cơ bản — đủ vào ở/cho thuê.','neutral','unverified',array[]::text[]),
  ('pk-tiendo','body',1,'Chu kỳ ~2,5 năm từ động thổ (1/2026) đến bàn giao (Q3/2028). Nhà đầu tư cần tính thời gian chôn vốn tới 2028 trước khi có dòng tiền cho thuê.','neutral','sales_claim',array[]::text[]),
  ('pk-matdo','body',1,'Mật độ xây dựng ~51,66% (4.019/7.877,8 m²) là khá cao — em nói thật để Anh/Chị ưu tiên không gian thoáng cân nhắc; bù lại vị trí và giá là điểm mạnh.','story','sales_claim',array[]::text[]),

  ('ti-hoboi','hook',1,'Dự án có hồ bơi trong cụm tiện ích "all-in-one" phục vụ ~1.274 cư dân — quy mô vừa phải, hợp dự án 1 tháp.','neutral','sales_claim',array[]::text[]),
  ('ti-congvien','body',1,'Công viên cây xanh & đường dạo bộ nội khu — không gian sinh hoạt vừa đủ (giới hạn bởi đất nhỏ), không nên kỳ vọng công viên lớn.','neutral','sales_claim',array[]::text[]),
  ('ti-treem','body',1,'Khu vui chơi trẻ em & nhà trẻ nội khu — đúng tệp gia đình trẻ, hỗ trợ giữ chân cư dân ở thật và nhu cầu thuê của hộ có con nhỏ.','neutral','sales_claim',array[]::text[]),
  ('ti-theduc','body',1,'Gym, Yoga, khu BBQ — tiện ích thể chất & gắn kết cộng đồng, hợp cư dân trẻ và nhóm khách thuê quanh ĐHQG/KCN.','neutral','sales_claim',array[]::text[]),
  ('ti-thuongmai','hook',1,'Siêu thị mini & khối đế thương mại tạo mô hình all-in-one — cư dân không cần đi xa cho nhu cầu cơ bản, đồng thời là tiện ích hút khách thuê.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b007' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch C: hạ tầng · giá & chính sách ──────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('ht-metro','hook',1,'Metro số 1 (Bến Thành – Suối Tiên) đã vận hành thương mại từ 12/2024; ga cuối Suối Tiên/Bến xe Miền Đông mới gần trục Thống Nhất — hạ tầng thật, không phải lời hứa.','neutral','verified',array[]::text[]),
  ('ht-bxmd','body',1,'Bến xe Miền Đông mới — đầu mối vận tải liên vùng kết nối Metro số 1, tạo lưu lượng & nhu cầu lưu trú/thuê quanh khu Thống Nhất – Đông Hòa.','neutral','sales_claim',array[]::text[]),
  ('ht-dhqg','hook',1,'ĐHQG TP.HCM (Làng Đại học) ngay địa bàn Đông Hòa — hàng trăm nghìn sinh viên, giảng viên, cán bộ: nguồn cầu thuê căn hộ ổn định và bền vững nhất khu vực.','neutral','sales_claim',array[]::text[]),
  ('ht-thongnhat','body',1,'Đường Thống Nhất (32m, 6 làn) cơ bản hoàn thành GĐ1; GĐ2 (2026–2028) nối Ga Dĩ An + ga Metro + Bến xe Miền Đông mới — trục xương sống kết nối của khu.','neutral','sales_claim',array[]::text[]),
  ('ht-vanhdai','body',1,'Đông Hòa là cửa ngõ Đông TP.HCM, hội tụ Vành đai 3, Mỹ Phước – Tân Vạn, Xa lộ Hà Nội, QL1A/QL1K, Phạm Văn Đồng — lưới kết nối đa hướng.','neutral','sales_claim',array[]::text[]),
  ('ht-kcn','body',1,'KCN Sóng Thần, VSIP, Linh Trung, Khu Công nghệ cao cách 5–10 phút — nguồn cầu thuê thứ hai (sau Làng ĐH): chuyên gia, kỹ sư, công nhân tay nghề cao.','neutral','sales_claim',array[]::text[]),
  ('ht-tacdong','body',1,'Cộng hưởng hạ tầng: Metro đã chạy + Bến xe Miền Đông mới + ĐHQG + KCN + Thống Nhất nâng cấp + Vành đai 3 + cú hích sáp nhập TP.HCM — nền cho cầu ở thực & cho thuê bền.','story','sales_claim',array[]::text[]),

  ('cs-gia','body',1,'Dự án vừa động thổ nên CHƯA có bảng giá chính thức. Tham chiếu hệ Bcons cùng khu, mức dự kiến ~45–60tr/m², tổng giá căn 1–2PN ~2,2–3,5 tỷ — em chỉ báo con số chốt khi có bảng giá phát hành.','neutral','unverified',array[]::text[]),
  ('cs-benchmark','body',1,'Mặt bằng giá Dĩ An – Thủ Đức (12/2025): vừa túi tiền ~31–46tr/m² (Phú Đông ~31–38; Bcons Polaris ~39; Bcons City ~46), dự án có Metro/mới ~50–60tr (Center City ~55). Đây là khung để Anh/Chị định giá hợp lý.','neutral','sales_claim',array[]::text[]),
  ('cs-thanhtoan','body',1,'Chính sách chưa công bố riêng; chuẩn Bcons điển hình: giữ chỗ ~30 triệu hoàn lại 100%, thanh toán 10–20% nhận nhà, trả chậm tới ~2 năm 0% lãi với OCB bảo lãnh/cho vay.','neutral','unverified',array[]::text[]),
  ('cs-yield','hook',1,'Luận điểm mạnh nhất: yield khu vực ~5–7%/năm (cao hơn lõi TP.HCM ~2–4%), giá thuê 1–2PN ~8–15 triệu/tháng — dòng tiền cho thuê thực từ ĐHQG + KCN.','neutral','sales_claim',array['Yield khu vực','Giá thuê tham khảo']),
  ('cs-yield','body',1,'Em nhấn dòng tiền thực thay vì kỳ vọng tăng giá: nguồn thuê là giảng viên/cán bộ ĐHQG, sinh viên ở ghép, chuyên gia/kỹ sư KCN — cầu bền, ít phụ thuộc đầu cơ.','story','sales_claim',array['So với khu lõi']),
  ('cs-thoidiem','body',1,'CĐT lập luận mua GĐ1 (sau động thổ) hưởng giá tốt nhất + chọn căn đẹp. Em nói cân bằng: đổi lại là rủi ro pháp lý sớm và chôn vốn tới 2028 — hợp khẩu vị dài hạn, không hợp lướt nhanh.','story','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b007' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;

-- ── Batch D: so sánh · phân tích đầu tư ──────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('tt-bicanh','body',1,'Bối cảnh: BĐS Dĩ An/Bình Dương cũ phục hồi (giá +10–15% tùy vị trí 6T/2025), thanh khoản dự án Bcons khu Đông Hòa tốt, cú hích sáp nhập + Metro tăng quan tâm — phân khúc vừa túi tiền gần Metro/ĐHQG đang có cầu thực.','neutral','sales_claim',array[]::text[]),
  ('tt-bcons-noi','body',1,'Trung thực: ngay trên trục Thống Nhất, Hoàng Nam cạnh tranh với chính Bcons City/Center City. Em giúp Anh/Chị so giá–tiến độ–vị trí cụ thể để chọn đúng dự án theo nhu cầu, không "dìm" lẫn nhau.','story','sales_claim',array[]::text[]),
  ('tt-phudong','body',1,'Đối thủ trực tiếp Phú Đông SkyOne (~31–38tr/m², gần KCN, yield 5–7%). So với Hoàng Nam (~45–60 dự kiến): SkyOne giá mềm hơn; Hoàng Nam bám trục Thống Nhất/hệ Bcons hơn. Em đưa cả hai để Anh/Chị tự cân.','neutral','sales_claim',array['Giá','Cho thuê']),
  ('tt-lapura','body',1,'La Pura (Phát Đạt, Thuận An) là đại dự án khác phân khúc/quy mô, nhưng góp phần tăng nguồn cung căn hộ Bình Dương cũ giai đoạn tới — yếu tố cần tính khi đánh giá thanh khoản bán lại.','neutral','sales_claim',array[]::text[]),
  ('tt-dinhvi','body',1,'SWOT thẳng thắn — Mạnh: CĐT uy tín giao nhà, cầu thuê kép (ĐHQG+KCN), bám Metro, giá mềm, cú hích sáp nhập. Yếu: mới động thổ (pháp lý chưa rõ, chôn vốn tới 2028), mật độ cao, cạnh tranh dày, là dự án hợp tác.','story','sales_claim',array[]::text[]),
  ('tt-thanhkhoan','body',1,'Thanh khoản dựa vào cầu ở thực + cho thuê hơn đầu cơ: căn 1–2PN ~2–3,5 tỷ có tệp mua & thuê lớn; nhưng nguồn cung khu vực dồi dào (Bcons, Phú Đông, La Pura) nên cạnh tranh bán lại/cho thuê.','neutral','sales_claim',array[]::text[]),

  ('dt-thesis','hook',1,'Luận điểm đầu tư [TEN_DU_AN] gói trong 5 trụ: dòng thuê thực bền vững · giá vừa túi tiền · bám Metro/TOD · uy tín Bcons giao nhà · cú hích sáp nhập TP.HCM.','story','sales_claim',array[]::text[]),
  ('dt-thesis','body',1,'Khác với nhiều dự án vùng ven: đây là phân khúc dòng tiền (yield 5–7%) chứ không bán kỳ vọng tăng giá đột biến — phù hợp nhà đầu tư an toàn, dài hạn.','neutral','sales_claim',array[]::text[]),
  ('dt-dongtien','body',1,'Mô phỏng: căn 2PN ~2,8 tỷ với chính sách Bcons điển hình → vốn ban đầu thấp, giãn tới bàn giao. Điểm cộng: yield khu vực 5–7% tiệm cận/đủ bù lãi vay — khác hẳn khu lõi yield ~2% không đủ bù lãi.','neutral','sales_claim',array[]::text[]),
  ('dt-ruiro','body',1,'Bản đồ rủi ro em luôn nói rõ: pháp lý bán hàng chưa công bố (mới động thổ), số liệu thị trường còn nhiễu, nguồn cung khu vực lớn, và bàn giao xa (2028) nên chôn vốn dài.','story','unverified',array[]::text[]),
  ('dt-khuyennghi','body',1,'Chọn theo mục tiêu: ở thật/cho thuê dài hạn quanh ĐHQG-KCN → phù hợp; lướt sóng nhanh → KHÔNG hợp (bàn giao 2028, pháp lý sớm). Em tư vấn đúng khẩu vị, không ép.','neutral','sales_claim',array[]::text[]),
  ('dt-khuyennghi','cta',1,'Anh/Chị cho biết mục tiêu (ở/cho thuê) và ngân sách — [TEN_SALE] tư vấn căn & phương án vốn phù hợp ([SDT]).','neutral','verified',array[]::text[]),
  ('dt-trigger','body',1,'Tín hiệu MUA mạnh hơn: CĐT công bố GPXD + văn bản đủ điều kiện bán; giá GĐ1 mềm hơn Bcons Center City; Thống Nhất GĐ2 & Vành đai 3 đúng hạn. Tín hiệu THẬN TRỌNG: chậm/thiếu pháp lý bán hàng, giá ngang dự án đã hiện hữu, nguồn cung bung mạnh.','neutral','sales_claim',array[]::text[]),
  ('dt-kh','body',1,'Tệp khách [TEN_DU_AN]: gia đình trẻ/chuyên gia/trí thức làm việc khu Đông – Thủ Đức – KCN mua để ở (vốn vào thấp); nhà đầu tư cho thuê nhắm cầu ĐHQG + KCN; người lao động muốn an cư gần chỗ làm, tận dụng Metro.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id='00000000-0000-0000-0000-00000000b007' and n.node_key=v.node_key
on conflict (node_id, role, variant_no) do nothing;
