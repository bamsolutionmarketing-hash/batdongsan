-- Diamond Sky · Vạn Phúc City (b009) — draft content blocks for the Assembly Engine.
-- Idempotent; node_id resolved by (project_id, node_key). Loads after
-- seed_knowledge_diamond.sql.
--
-- COMPLIANCE BY DESIGN: căn hộ cao tầng ĐẦU TIÊN trong đại đô thị Vạn Phúc City
-- 198ha với thế mạnh thật (hệ sinh thái + cộng đồng ~10.000 cư dân đã hiện hữu,
-- vị trí kim cương ven sông SG/hồ Đại Nhật, mặt tiền QL13 sắp mở rộng 60m, chính
-- chủ đại đô thị Van Phuc Group, pháp lý phân khu thấp tầng đã có sổ) VÀ rủi ro
-- thật (giá 120–150tr/m² còn là DỰ KIẾN/rumor chưa công bố, số căn 296 vs 306 &
-- diện tích mâu thuẫn nguồn, cao tầng là dòng sản phẩm MỚI của CĐT, một số tiện
-- ích lớn Ocean World/Van Phuc Center CHƯA xong, yield thấp ~2–3% nên lợi nhuận
-- trông vào tăng giá vốn, Block B officetel sở hữu có thời hạn). Node giá/pháp lý/
-- rủi ro/số liệu dùng copy trung thực (neutral/story, KHÔNG fomo) + min_confidence
-- unverified. Thế mạnh hiện hữu để sales_claim; chỉ dữ kiện đã chốt mới verified.
-- Placeholders: [TEN_DU_AN]=tên dự án · [TEN_SALE]=tên sale · [SDT]=điện thoại.

-- ── Batch A: hero · tổng quan · vị trí ───────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('diamond','hook',1,'[TEN_DU_AN] — căn hộ cao tầng ĐẦU TIÊN trong đại đô thị Vạn Phúc City 198ha đã hình thành: "điểm vào" hệ sinh thái ven sông cho khách không mua nhà phố/biệt thự thấp tầng.','story','sales_claim',array['Tên dự án','Chủ đầu tư']),
  ('diamond','hook',2,'Tọa độ kim cương: 3 hướng view sông Sài Gòn, trước mặt hồ Đại Nhật + quảng trường nhạc nước, mặt tiền QL13 — do chính chủ đại đô thị Van Phuc Group phát triển.','neutral','sales_claim',array['Vị trí','View','Chủ đầu tư']),
  ('diamond','hook',3,'Câu chuyện 3 dòng: vào ở là có ngay cộng đồng ~10.000 cư dân + 500+ thương hiệu hiện hữu; lợi thế ven sông khan hiếm + QL13 đang mở rộng. Em nói rõ giá còn là dự kiến.','story','sales_claim',array[]::text[]),
  ('diamond','body',1,'Tổ hợp phức hợp: Block A căn hộ (21 tầng, sở hữu lâu dài) + Block B khách sạn/officetel/TMDV (18 tầng) + 2 tầng hầm, trong KĐT Vạn Phúc City 198ha (~3 tỷ USD).','neutral','sales_claim',array['Cấu trúc','Pháp lý']),
  ('diamond','body',2,'Khởi công hầm 08–09/01/2026, bàn giao dự kiến cuối 2027/2028 hoàn thiện cao cấp — em luôn nói rõ giai đoạn để Anh/Chị tính dòng vốn (đang nhận booking giữ chỗ).','neutral','sales_claim',array['Khởi công hầm','Bàn giao']),
  ('diamond','cta',1,'Nhắn [TEN_SALE] – [SDT] để nhận thông tin chính thức, chính sách giữ chỗ & bảng giá [TEN_DU_AN] khi mở bán GĐ1.','neutral','verified',array[]::text[]),
  ('diamond','cta',2,'Anh/Chị để lại số — [TEN_SALE] cập nhật tiến độ & dẫn tham quan hệ sinh thái Vạn Phúc City hiện hữu (Zalo [SDT]).','neutral','verified',array[]::text[]),

  ('tq-vitri','hook',1,'[TEN_DU_AN] nằm ở trung tâm Vạn Phúc City, mặt tiền Quốc lộ 13 — "đường tơ lụa" nối TP.HCM – Bình Dương – Bình Phước, sở hữu 3 hướng view sông Sài Gòn.','neutral','sales_claim',array[]::text[]),
  ('tq-vitri','body',1,'Kết nối: QL13 → Phạm Văn Đồng → sân bay Tân Sơn Nhất & trung tâm Q1/Q3 chỉ ~10 phút; QL13 → QL1A đi Đồng Nai, Bình Dương, Long An. Cận trục chính nội khu 52m.','neutral','sales_claim',array[]::text[]),
  ('tq-vitri','proof',1,'Trước mặt là hồ Đại Nhật + quảng trường nhạc nước — sản phẩm ven sông/ven hồ cao cấp ở khu Đông vốn rất khan hiếm.','story','sales_claim',array[]::text[]),
  ('tq-quymo','body',1,'Cấu trúc nhất quán giữa các nguồn: 2 block (A căn hộ + B khách sạn/officetel/TMDV) + 2 hầm. Em chỉ dùng số liệu CĐT công bố chính thức khi tư vấn.','neutral','unverified',array[]::text[]),
  ('tq-mauthuan','body',1,'Em chống nhiễu thông tin: dự án mới khởi công phần hầm 1/2026, chưa có bảng hàng chính thức nên đang lưu hành nhiều con số (296 vs 306 căn). Em không "chốt" số khi chưa có văn bản CĐT.','neutral','unverified',array[]::text[]),
  ('tq-blocks','body',1,'Mô hình residence + commercial + officetel/hotel: Block A để ở, Block B khai thác thương mại – lưu trú – văn phòng, bổ trợ TTTM Vạn Phúc Center — tạo nhịp sống khép kín.','neutral','sales_claim',array[]::text[]),
  ('tq-thietke','hook',1,'Theo nguồn thị trường, kiến trúc [TEN_DU_AN] lấy ý tưởng hoàng gia Châu Âu, tầm nhìn panorama hướng sông Sài Gòn, hồ Đại Nhật và trung tâm thành phố.','story','sales_claim',array[]::text[]),
  ('tq-dinhvi','hook',1,'Điểm bán cốt lõi: [TEN_DU_AN] là sản phẩm cao tầng ĐẦU TIÊN trong Vạn Phúc City — "entry point" cho khách muốn vào hệ sinh thái Vạn Phúc nhưng không mua thấp tầng (giá trị lớn hơn nhiều).','story','sales_claim',array[]::text[]),
  ('tq-dinhvi','body',1,'Em tư vấn đúng tầm: khách mua là mua "suất" vào đại đô thị ven sông đã vận hành, không phải đô thị trên giấy.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id = '00000000-0000-0000-0000-00000000b009' and n.node_key = v.node_key
on conflict do nothing;

-- ── Batch B: chủ đầu tư · hệ sinh thái Vạn Phúc ──────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('cdt-vpg','hook',1,'CĐT [TEN_DU_AN] là Van Phuc Group (Tập đoàn Vạn Phúc / Đại Phúc) — chính "chủ nhà" gắn liền toàn bộ đại đô thị Vạn Phúc City, ~26–30 năm phát triển BĐS.','neutral','sales_claim',array['Thế mạnh','Dự án lõi']),
  ('cdt-vpg','proof',1,'Lợi thế khi tư vấn: [TEN_DU_AN] do chính chủ đầu tư đại đô thị phát triển — cộng hưởng thương hiệu, tiện ích và cộng đồng cư dân Vạn Phúc sẵn có.','story','sales_claim',array[]::text[]),
  ('cdt-vpcity','hook',1,'Đại đô thị ven sông quy mô lớn bậc nhất khu Đông: Vạn Phúc City 198ha (~3 tỷ USD), 3 mặt giáp sông Sài Gòn (~3,4 km), quy hoạch ~45.000 cư dân.','neutral','sales_claim',array['Quy mô','Vốn đầu tư','Vị thế']),
  ('cdt-vpcity','body',1,'[TEN_DU_AN] là mảnh ghép cao tầng trong tổng thể này — gần giao lộ QL13 × Phạm Văn Đồng, cách sân bay Tân Sơn Nhất ~10 phút.','neutral','sales_claim',array[]::text[]),
  ('cdt-quyhoach','body',1,'Quy hoạch xanh: ~50% trong 198ha là không gian xanh + mặt nước, mật độ xây dựng chỉ ~40%, 80% công trình là thấp tầng. Căn hộ cao tầng tập trung quanh hồ Đại Nhật — nơi [TEN_DU_AN] tọa lạc.','neutral','sales_claim',array[]::text[]),
  ('cdt-hientrang','proof',1,'Khác "đô thị trên giấy": Vạn Phúc City đã có ~10.000 cư dân + hơn 500 thương hiệu kinh doanh, là nơi đặt trụ sở nhiều doanh nghiệp, thu hút chuyên gia nước ngoài — cộng đồng & nguồn thuê có thật.','neutral','sales_claim',array[]::text[]),
  ('cdt-track','body',1,'Van Phuc Group có lịch sử bàn giao tốt ở phân khúc thấp tầng (nhà phố, biệt thự, shophouse) kèm sổ hồng — bảo chứng năng lực phát triển đại đô thị. Em lưu ý cao tầng là dòng sản phẩm mới của CĐT.','neutral','sales_claim',array[]::text[]),
  ('cdt-phankhu','body',1,'Hệ phân khu đa dạng (Vạn Phúc 1, Đông Nam, Sunlake, Jardin, Royal…) đã tạo cộng đồng & tiện ích — nền tảng để [TEN_DU_AN] kế thừa ngay khi về ở.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id = '00000000-0000-0000-0000-00000000b009' and n.node_key = v.node_key
on conflict do nothing;

-- ── Batch C: pháp lý · mặt bằng ──────────────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('pl-vpcity','body',1,'KĐT Vạn Phúc City được quảng bá pháp lý minh bạch; nhiều phân khu thấp tầng đã bàn giao + cấp sổ hồng cho cư dân — bảo chứng về nền pháp lý tổng thể của đại đô thị.','neutral','sales_claim',array[]::text[]),
  ('pl-sohuu','hook',1,'Block A (căn hộ ở) của [TEN_DU_AN]: sở hữu LÂU DÀI cho người Việt — lợi thế giữ giá & thanh khoản thứ cấp dài hạn (room nước ngoài tối đa 30%/tòa theo luật).','neutral','sales_claim',array[]::text[]),
  ('pl-blockB','body',1,'Em phân biệt rõ cho Anh/Chị: Block B (officetel/khách sạn/TMDV) thường sở hữu CÓ THỜI HẠN theo thời hạn đất dự án, không lâu dài như căn hộ ở; pháp lý officetel/condotel ở VN còn điểm cần lưu ý.','neutral','unverified',array[]::text[]),
  ('pl-hientrang','body',1,'[TEN_DU_AN] mới khởi công phần hầm 1/2026, đang nhận booking giữ chỗ. Ở giai đoạn sớm này em sẽ cùng Anh/Chị xác minh dự án đã có văn bản đủ điều kiện bán nhà ở hình thành trong tương lai hay chưa.','neutral','unverified',array[]::text[]),
  ('pl-checklist','body',1,'Checklist trước cọc em luôn rà với khách: (1) chủ trương đầu tư + quy hoạch 1/500; (2) giấy phép xây dựng; (3) văn bản đủ điều kiện bán — nếu CHƯA có thì chỉ "giữ chỗ" hoàn lại; (4) bảng giá + xác định Block A hay B; (5) bảo lãnh ngân hàng đúng mã căn; (6) tiến độ ≤70% trước bàn giao, ≤95% trước khi cấp sổ.','neutral','unverified',array[]::text[]),
  ('pk-blockA','hook',1,'Block A — khối ở chính: ~7.538 m² sàn, 21 tầng (T1–2 shophouse · T3 tiện ích/hồ bơi · T4–21 căn hộ), view sông Sài Gòn & hồ Đại Nhật.','neutral','sales_claim',array['Diện tích sàn','Chiều cao','Bố trí']),
  ('pk-blockA','body',1,'Số căn ~306 (GĐ1) còn cần đối chiếu (vanphuc.city nêu ~296) — em chỉ xác nhận khi có bảng hàng chính thức.','neutral','unverified',array['Số căn']),
  ('pk-blockB','body',1,'Block B ~10.043 m² sàn, 18 tầng: T1–3 TM + rạp phim, T4 nhà hàng, T5–17 văn phòng/officetel — khối khai thác thương mại bổ trợ TTTM Vạn Phúc Center.','neutral','sales_claim',array['Diện tích sàn','Bố trí']),
  ('pk-loaican','body',1,'CĐT định vị "số lượng giới hạn". Cơ cấu loại căn (1PN/2PN/3PN) & diện tích từng loại chưa công bố đầy đủ tại thời điểm khởi công — em cập nhật ngay khi có rổ hàng.','neutral','unverified',array[]::text[]),
  ('pk-bangiao','body',1,'Theo công bố, [TEN_DU_AN] bàn giao hoàn thiện chuẩn cao cấp; chi tiết bộ tiêu chuẩn (thương hiệu thiết bị, mức nội thất) chưa công bố cụ thể.','neutral','unverified',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id = '00000000-0000-0000-0000-00000000b009' and n.node_key = v.node_key
on conflict do nothing;

-- ── Batch D: tiện ích · hạ tầng ──────────────────────────────────────────────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('ti-hodainhat','hook',1,'Ngay trước mặt [TEN_DU_AN] là hồ trung tâm Đại Nhật + quảng trường Diamond với nhạc nước biểu diễn mỗi cuối tuần — điểm nhấn cảnh quan & giải trí của đại đô thị.','story','sales_claim',array[]::text[]),
  ('ti-song','body',1,'Vạn Phúc City có ~3,4 km sông Sài Gòn bao quanh (3 mặt), công viên The Long Park ~11ha, kênh Sông Trăng ~2km — [TEN_DU_AN] thừa hưởng cảnh quan sông – hồ – kênh đặc trưng.','neutral','sales_claim',array[]::text[]),
  ('ti-noikhu','body',1,'Tiện ích nội khu (tầng đế/T3): hồ bơi 4 mùa, hồ bơi vô cực, gym, yoga, phòng sinh hoạt đa năng, khu BBQ ngoài trời, sân bóng rổ, công viên sân vườn.','neutral','sales_claim',array[]::text[]),
  ('ti-royal','proof',1,'Cộng đồng có thật: ~10.000 cư dân + 500+ thương hiệu, phố đi bộ Châu Âu Royal, chuỗi shophouse — nhịp sống thương mại sôi động ngay quanh [TEN_DU_AN].','neutral','sales_claim',array[]::text[]),
  ('ti-oceanworld','body',1,'Em nói thật về tiện ích tương lai: công viên giải trí Ocean World ~16ha mới ở quy hoạch, CHƯA triển khai — là kỳ vọng dài hạn, không phải thứ đã có.','neutral','unverified',array[]::text[]),
  ('ti-vanphuccenter','body',1,'TTTM Vạn Phúc Center (gắn với khối TMDV Block B) được quy hoạch là hạt nhân mua sắm – giải trí của đại đô thị, hiện CHƯA hoàn thành — em cập nhật tiến độ khi có.','neutral','unverified',array[]::text[]),
  ('ht-ql13','hook',1,'Chất xúc tác hạ tầng lớn: QL13 nâng cấp lên 60m, 10 làn xe, tổng vốn >21.000 tỷ, dự kiến khởi công Q2/2026, hoàn thành 2028 — biến cửa ngõ Đông Bắc thành "đại lộ đô thị".','neutral','sales_claim',array[]::text[]),
  ('ht-pvd','body',1,'QL13 → Đại lộ Phạm Văn Đồng (12 làn) → sân bay Tân Sơn Nhất & trung tâm Q1/Q3 chỉ ~10 phút — kết nối huyết mạch đã hiện hữu, không phải chờ tương lai.','neutral','sales_claim',array[]::text[]),
  ('ht-tacdong','proof',1,'Các lớp giá trị quanh [TEN_DU_AN]: hệ sinh thái 198ha + cộng đồng đã hiện hữu (de-risk một phần); kết nối Q1/sân bay ~10 phút đã có; QL13 mở rộng là chất xúc tác trung hạn; Metro 3B/Vành đai 2/đường thủy là dài hạn.','story','sales_claim',array[]::text[]),
  ('ht-metro','body',1,'Theo quy hoạch, khu vực hưởng lợi từ Metro số 3B và đường sắt Bắc–Nam đi qua/gần — bổ sung lựa chọn giao thông công cộng dài hạn (em ghi rõ là quy hoạch).','neutral','unverified',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id = '00000000-0000-0000-0000-00000000b009' and n.node_key = v.node_key
on conflict do nothing;

-- ── Batch E: giá · chính sách · so sánh · đầu tư (trung thực, KHÔNG fomo) ─────
insert into node_content_blocks (node_id, role, variant_no, text, tone, min_confidence, fact_keys, is_enabled)
select n.id, v.role::block_role_t, v.variant_no, v.text, v.tone::block_tone_t, v.min_confidence::confidence_t, v.fact_keys, true
from (values
  ('cs-gia','body',1,'[TEN_DU_AN] CHƯA có bảng giá chính thức (đang nhận booking, mở bán GĐ1). Mức ~120–150tr/m² hiện là dự kiến/rumor — em không cam kết con số, sẽ gửi bảng giá ngay khi CĐT công bố.','neutral','unverified',array[]::text[]),
  ('cs-thanhtoan','body',1,'Chính sách điển hình của Van Phuc Group: thanh toán ~30% kéo dài 2–3 năm, hỗ trợ vay ngân hàng, trả góp ưu đãi; [TEN_DU_AN] đang nhận booking giữ chỗ. Em xác nhận chính sách cụ thể theo từng đợt.','neutral','unverified',array[]::text[]),
  ('cs-yield','body',1,'Em nói thẳng về dòng tiền: ở mức giá ~120–150tr/m², yield cho thuê dự kiến chỉ ~2–3% — thấp hơn lãi vay. [TEN_DU_AN] phù hợp khẩu vị tích sản/tăng giá vốn hơn là sống nhờ dòng thuê.','neutral','unverified',array[]::text[]),
  ('cs-benchmark','body',1,'Tham chiếu khu vực: Thủ Đức hiện ~35–60tr/m², Thủ Thiêm đã 200–350tr/m². [TEN_DU_AN] (~120–150) nằm giữa — còn dư địa nếu QL13 hoàn thiện, nhưng cũng là phần bù lớn so với hàng xóm. Em trình bày cả hai mặt.','neutral','unverified',array[]::text[]),
  ('cs-thitruong','proof',1,'Bối cảnh: khu Đông tiếp tục dẫn dắt nguồn cung & giá, sản phẩm ven sông cao cấp khan hiếm; QL13 mở rộng (>21.000 tỷ) là động lực hạ tầng; mặt bằng Thủ Thiêm 200–350tr/m² tạo "trần tham chiếu".','neutral','sales_claim',array[]::text[]),
  ('tt-opal','body',1,'So sánh thẳng: Opal Boulevard (Đất Xanh, Phạm Văn Đồng) ~35tr/m², đã bàn giao. [TEN_DU_AN] định vị cao cấp hơn hẳn nhờ hệ sinh thái Vạn Phúc + ven sông, nhưng giá cũng cao hơn nhiều lần.','neutral','sales_claim',array[]::text[]),
  ('tt-thuthiem','body',1,'Lõi cao cấp khu Đông là Thủ Thiêm (Empire ~210–500, Metropole ~170–440, Sala ~200–260) — "trần giá" cao hơn [TEN_DU_AN] đáng kể, là cơ sở để định vị dư địa.','neutral','unverified',array[]::text[]),
  ('tt-premium','body',1,'Điểm cần tỉnh táo nhất em luôn nói rõ: [TEN_DU_AN] (~120–150tr/m²) định giá cao hơn 2–3 lần các dự án căn hộ lân cận đã bàn giao (Opal ~35, mặt bằng Thủ Đức ~40–60).','neutral','unverified',array[]::text[]),
  ('tt-dinhvi','proof',1,'SWOT trung thực — Mạnh: trong đại đô thị 198ha đã hình thành, vị trí kim cương ven hồ/sông, kết nối ~10 phút về Q1, CĐT pháp lý minh bạch. Yếu: phần bù giá lớn, số liệu chưa chính thức, cao tầng là dòng mới của CĐT, một số tiện ích lớn chưa xong, yield thấp.','neutral','sales_claim',array[]::text[]),
  ('dt-thesis','hook',1,'Luận điểm đầu tư [TEN_DU_AN] gói trong 4 trụ: (1) hệ sinh thái 198ha hiện hữu; (2) vị trí kim cương ven sông/hồ; (3) chất xúc tác QL13 mở rộng; (4) phần bù vị trí & headroom so với Thủ Thiêm.','story','sales_claim',array[]::text[]),
  ('dt-dongtien','body',1,'Mô phỏng: căn 2PN ~70 m² × ~130tr/m² ≈ 9,1 tỷ (ước lượng). Thanh toán giãn 30% → vốn ban đầu vừa phải, nhưng phần khi nhận nhà lớn; yield ~2–3% không bù đủ lãi vay → lợi nhuận trông vào tăng giá vốn.','neutral','unverified',array[]::text[]),
  ('dt-ruiro','body',1,'Bản đồ rủi ro em đặt lên bàn: giá còn rumor, phần bù lớn vs khu vực, tiện ích biểu tượng chưa xong, cao tầng là sản phẩm đầu tiên của CĐT, pháp lý bán hàng cần xác minh. Mua khi đã đối chiếu đủ.','neutral','unverified',array[]::text[]),
  ('dt-trigger','body',1,'Tín hiệu MUA mạnh hơn: CĐT công bố bảng giá hợp lý + văn bản đủ điều kiện bán, làm rõ số căn/tiêu chuẩn, QL13 khởi công đúng hẹn Q2/2026, tiện ích lớn khởi động. THẬN TRỌNG nếu giá vượt sức hấp thụ hoặc hạ tầng/tiện ích chậm kéo dài.','neutral','unverified',array[]::text[]),
  ('dt-kh','body',1,'Chân dung khách [TEN_DU_AN]: người muốn vào hệ sinh thái Vạn Phúc nhưng không mua thấp tầng; gia đình trẻ/cư dân hiện hữu yêu môi trường ven sông; chuyên gia làm việc trong Vạn Phúc; NĐT tích sản kỳ vọng tăng giá theo QL13.','neutral','sales_claim',array[]::text[])
) as v(node_key, role, variant_no, text, tone, min_confidence, fact_keys)
join knowledge_nodes n on n.project_id = '00000000-0000-0000-0000-00000000b009' and n.node_key = v.node_key
on conflict do nothing;
