-- Seed — demo developers + public projects for Phase 1. Idempotent (fixed UUIDs).
-- Knowledge maps live in seed_knowledge_*.sql (generated from docs/knowledge/*.html)
-- and load right after this file — see [db.seed] sql_paths in config.toml.

-- Developers -----------------------------------------------------------------
insert into developers (id, name, slug, parent_company, credibility) values
  ('00000000-0000-0000-0000-0000000000e1', 'Masterise Homes', 'masterise-homes', 'Masterise Group', 9),
  ('00000000-0000-0000-0000-0000000000e2', 'Keppel Land × Khang Điền', 'keppel-khang-dien', 'Keppel Ltd. / KDH', 9),
  ('00000000-0000-0000-0000-0000000000e3', 'Vinhomes (VHM)', 'vinhomes', 'Vingroup', 10)
on conflict (id) do nothing;

-- Projects — both public + demo so signed-out landing + free tier work ---------
insert into projects
  (id, developer_id, name, slug, phase, location_text, status, handover_est,
   price_min, price_max, price_confidence, is_demo, is_published)
values
  ('00000000-0000-0000-0000-00000000a001',
   '00000000-0000-0000-0000-0000000000e2',
   'Gladia by the Waters', 'gladia-by-the-water',
   'Thấp tầng + cao tầng', 'Bình Trưng Đông, TP. Thủ Đức, TP.HCM', 'selling', null,
   150000000, 170000000, 'broker_estimate', true, true),
  ('00000000-0000-0000-0000-00000000a006',
   '00000000-0000-0000-0000-0000000000e1',
   'Masteri Cosmo Central', 'masteri-cosmo-central',
   'Nexus Zone (CT3–CT4)', 'Lõi The Global City, P. Bình Trưng, TP.HCM', 'selling', '2028-09-30',
   92000000, 102000000, 'broker_estimate', true, true),
  -- Real project (not demo): khởi công 29/4/2026, chưa mở bán — giá rumor nên để null.
  ('00000000-0000-0000-0000-00000000b001',
   '00000000-0000-0000-0000-0000000000e3',
   'Vinhomes Saigon Park', 'vinhomes-saigon-park',
   'Giai đoạn 1 — khởi công 29/4/2026', 'Xã Xuân Thới Sơn (Hóc Môn), giáp Quận 12, TP.HCM', 'upcoming', null,
   null, null, 'broker_estimate', false, true)
on conflict (id) do nothing;
