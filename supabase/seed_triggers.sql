-- Demo time triggers — real, forward-looking infrastructure milestones that
-- drive the "Hôm Nay" deadline suggestions and the calendar "Hạn sắp tới" list.
-- Idempotent: skip rows that already exist (project_id + label + date).
insert into time_triggers (project_id, type, trigger_date, label, suggested_angle, node_ids, active_days_before)
select v.project_id, v.type, v.trigger_date, v.label, v.suggested_angle, v.node_ids, v.active_days_before
from (values
  ('00000000-0000-0000-0000-00000000a001'::uuid,'milestone','2026-06-30'::date,'Vành đai 3 thông toàn tuyến','road','{570e76d0-fbb9-5cf8-a877-e3cdb1681822}'::uuid[],30),
  ('00000000-0000-0000-0000-00000000a001'::uuid,'milestone','2026-09-30'::date,'Nút giao Mỹ Thủy 4 tầng về đích','road','{b27cb50a-723f-5628-9adb-7ad3d2b03059}'::uuid[],30),
  ('00000000-0000-0000-0000-00000000a006'::uuid,'milestone','2026-07-15'::date,'Sân bay Long Thành khai thác thương mại','infra','{cc48c271-5b68-55bd-98a0-db5084ffe518}'::uuid[],45),
  ('00000000-0000-0000-0000-00000000a006'::uuid,'milestone','2026-06-30'::date,'Vành đai 3 vận hành toàn tuyến','infra','{b2fa26a2-36bf-5d52-bbde-988aea043798}'::uuid[],30)
) as v(project_id, type, trigger_date, label, suggested_angle, node_ids, active_days_before)
where not exists (
  select 1 from time_triggers t
  where t.project_id = v.project_id and t.label = v.label and t.trigger_date = v.trigger_date
);
