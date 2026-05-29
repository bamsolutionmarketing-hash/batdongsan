-- M7 seed — a demo org with public projects + one knowledge map, so the app
-- shows real content on first deploy (and the landing demo works signed-out).
-- Idempotent: fixed UUIDs + ON CONFLICT, safe to re-run.

-- Demo org -------------------------------------------------------------------
insert into orgs (id, name) values
  ('00000000-0000-0000-0000-0000000000d0', 'Demo Sàn BĐS')
on conflict (id) do nothing;

-- Projects (one public for the signed-out demo) ------------------------------
insert into projects (id, org_id, slug, name, developer, district, city, segment, status, price_per_sqm_m, attributes, visibility) values
  ('00000000-0000-0000-0000-00000000a001',
   '00000000-0000-0000-0000-0000000000d0',
   'gladia-by-the-water', 'Gladia by The Water', 'Masterise Homes',
   'TP. Thủ Đức', 'TP.HCM', 'luxury', 'selling', 160,
   '{"amenities":["view sông","hồ bơi","công viên ven sông","an ninh 24/7"],"highlights":["Vị trí ven sông Sài Gòn","Bàn giao cao cấp"]}'::jsonb,
   'public'),
  ('00000000-0000-0000-0000-00000000a002',
   '00000000-0000-0000-0000-0000000000d0',
   'masteri-thao-dien', 'Masteri Thảo Điền', 'Masterise Homes',
   'Quận 2', 'TP.HCM', 'high-end', 'completed', 95,
   '{"amenities":["hồ bơi","gym","trung tâm thương mại"]}'::jsonb, 'org'),
  ('00000000-0000-0000-0000-00000000a003',
   '00000000-0000-0000-0000-0000000000d0',
   'masteri-an-phu', 'Masteri An Phú', 'Masterise Homes',
   'Quận 2', 'TP.HCM', 'high-end', 'handover', 110,
   '{"amenities":["hồ bơi","gym"]}'::jsonb, 'org'),
  ('00000000-0000-0000-0000-00000000a004',
   '00000000-0000-0000-0000-0000000000d0',
   'the-river-thu-thiem', 'The River Thủ Thiêm', 'Refico',
   'TP. Thủ Đức', 'TP.HCM', 'luxury', 'handover', 150,
   '{"amenities":["view sông","hồ bơi"]}'::jsonb, 'org'),
  ('00000000-0000-0000-0000-00000000a005',
   '00000000-0000-0000-0000-0000000000d0',
   'vinhomes-grand-park', 'Vinhomes Grand Park', 'Vinhomes',
   'TP. Thủ Đức', 'TP.HCM', 'mid-range', 'selling', 55,
   '{"amenities":["công viên","gym","trường học"]}'::jsonb, 'org')
on conflict (id) do nothing;

-- Knowledge map for the public demo project (Gladia) -------------------------
insert into map_nodes (id, org_id, project_id, label, kind, note) values
  ('00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Gladia by The Water','concept','Dự án trung tâm'),
  ('00000000-0000-0000-0000-00000000b002','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Vị trí ven sông Sài Gòn','location','Mặt tiền sông, view thoáng'),
  ('00000000-0000-0000-0000-00000000b003','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Công viên ven sông','amenity',null),
  ('00000000-0000-0000-0000-00000000b004','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Hồ bơi','amenity',null),
  ('00000000-0000-0000-0000-00000000b005','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Phân khúc hạng sang','selling_point','Khách tài chính mạnh, đề cao trải nghiệm'),
  ('00000000-0000-0000-0000-00000000b006','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','Chủ đầu tư Masterise','selling_point','Uy tín, bàn giao cao cấp'),
  ('00000000-0000-0000-0000-00000000b007','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','An ninh 24/7','amenity',null)
on conflict (id) do nothing;

insert into map_edges (id, org_id, project_id, source_id, target_id, kind) values
  ('00000000-0000-0000-0000-00000000c001','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-00000000b002','part_of'),
  ('00000000-0000-0000-0000-00000000c002','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b002','00000000-0000-0000-0000-00000000b003','near'),
  ('00000000-0000-0000-0000-00000000c003','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-00000000b004','part_of'),
  ('00000000-0000-0000-0000-00000000c004','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b002','00000000-0000-0000-0000-00000000b005','supports'),
  ('00000000-0000-0000-0000-00000000c005','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b006','00000000-0000-0000-0000-00000000b005','supports'),
  ('00000000-0000-0000-0000-00000000c006','00000000-0000-0000-0000-0000000000d0','00000000-0000-0000-0000-00000000a001','00000000-0000-0000-0000-00000000b001','00000000-0000-0000-0000-00000000b007','part_of')
on conflict (id) do nothing;
