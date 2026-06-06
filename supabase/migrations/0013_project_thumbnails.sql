-- 0013 Public bucket for project representative images (landing/public cards).
-- Public read (served via public URL); writes only via service-role (admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('thumbnails', 'thumbnails', true, 5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;
