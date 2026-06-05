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
