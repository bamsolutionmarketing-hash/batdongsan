-- Private storage buckets for the branding pipeline.
--   assets/  — admin-uploaded master images
--   branded/ — per-agent composited output (signed URLs)
--   logos/   — agent logos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('assets',  'assets',  false, 10485760, array['image/png','image/jpeg','image/webp']),
  ('branded', 'branded', false, 10485760, array['image/jpeg','image/png']),
  ('logos',   'logos',   false,  2097152, array['image/png','image/jpeg','image/webp','image/svg+xml'])
on conflict (id) do nothing;
