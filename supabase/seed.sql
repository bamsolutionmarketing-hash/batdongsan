-- M7 seed — a demo org with public projects + one knowledge map, so the app
-- shows real content on first deploy (and the landing demo works signed-out).
-- Idempotent: fixed UUIDs + ON CONFLICT, safe to re-run.

-- Demo org -------------------------------------------------------------------
insert into orgs (id, name) values
  ('00000000-0000-0000-0000-0000000000d0', 'Demo Sàn BĐS')
on conflict (id) do nothing;

-- Projects — all public so the signed-out landing demo shows real
-- relationships (same developer / same district / same segment edges).
insert into projects (id, org_id, slug, name, developer, district, city, segment, status, price_per_sqm_m, attributes, visibility) values
  ('00000000-0000-0000-0000-00000000a001',
   '00000000-0000-0000-0000-0000000000d0',
   'gladia-by-the-water', 'Gladia by the Waters', 'Keppel Land × Khang Điền',
   'TP. Thủ Đức', 'TP.HCM', 'luxury', 'selling', 160,
   '{"amenities":["ba mặt giáp sông","mật độ xây dựng 23–38%","trần 3.05m chuẩn Singapore","an ninh 24/7"],"highlights":["BCA Green Mark for Districts đầu tiên tại Việt Nam","Liên doanh Keppel (Singapore) × Khang Điền","Cạnh ga Metro 6 Phú Hữu (2030)"]}'::jsonb,
   'public'),
  ('00000000-0000-0000-0000-00000000a002',
   '00000000-0000-0000-0000-0000000000d0',
   'masteri-thao-dien', 'Masteri Thảo Điền', 'Masterise Homes',
   'Quận 2', 'TP.HCM', 'high-end', 'completed', 95,
   '{"amenities":["hồ bơi","gym","trung tâm thương mại"]}'::jsonb, 'public'),
  ('00000000-0000-0000-0000-00000000a003',
   '00000000-0000-0000-0000-0000000000d0',
   'masteri-an-phu', 'Masteri An Phú', 'Masterise Homes',
   'Quận 2', 'TP.HCM', 'high-end', 'handover', 110,
   '{"amenities":["hồ bơi","gym"]}'::jsonb, 'public'),
  ('00000000-0000-0000-0000-00000000a004',
   '00000000-0000-0000-0000-0000000000d0',
   'the-river-thu-thiem', 'The River Thủ Thiêm', 'Refico',
   'TP. Thủ Đức', 'TP.HCM', 'luxury', 'handover', 150,
   '{"amenities":["view sông","hồ bơi"]}'::jsonb, 'public'),
  ('00000000-0000-0000-0000-00000000a005',
   '00000000-0000-0000-0000-0000000000d0',
   'vinhomes-grand-park', 'Vinhomes Grand Park', 'Vinhomes',
   'TP. Thủ Đức', 'TP.HCM', 'mid-range', 'selling', 55,
   '{"amenities":["công viên","gym","trường học"]}'::jsonb, 'public'),
  ('00000000-0000-0000-0000-00000000a006',
   '00000000-0000-0000-0000-0000000000d0',
   'masteri-cosmo-central', 'Masteri Cosmo Central', 'Masterise Homes',
   'TP. Thủ Đức', 'TP.HCM', 'high-end', 'selling', 100,
   '{"amenities":["hồ bơi vô cực","business lounge","co-working","gym","yoga","teen club"],"highlights":["Lõi The Global City do Foster + Partners quy hoạch","6 tháp 19–29 tầng, bàn giao Q3/2028","Phân khu Nexus Zone — work-life synergy"]}'::jsonb,
   'public')
on conflict (id) do nothing;

-- The Gladia knowledge map lives in seed_gladia_map.sql (generated from the
-- authored map by scripts/gen_gladia_map.mjs) and is loaded right after this
-- file — see [db.seed] sql_paths in config.toml.
