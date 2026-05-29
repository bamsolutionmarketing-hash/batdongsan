# MVP — Trạng thái & Checklist nghiệm thu

> Lát cắt validate (xem [MVP.md](./MVP.md)). Toàn bộ code đã build/test sạch trên
> branch. Phần "cần bạn" là các bước trên Supabase/Vercel cần tài khoản thật.

## Trạng thái các bước
| Bước | Nội dung | Code |
|---|---|---|
| M0 | Nền deploy: Next.js + Supabase clients + schema + RLS + CI | ✅ |
| M1 | Auth + org + role (multi-tenant) | ✅ |
| M2 | CRUD dự án + map/filter đọc từ DB | ✅ |
| M3 | Upload file → engine rule-based (Python) → màn duyệt | ✅ |
| M4 | Learning hub `/p/[slug]` + talking points | ✅ |
| M5 | Lead-gen content (FB post + caption) | ✅ |
| M6 | Front door (card grid) + form "Liên hệ mua" | ✅ |
| M7 | Seed demo + dự án public + bản đồ tri thức mẫu | ✅ |
| — | Bonus: bản đồ tri thức per-project (admin tạo/sửa) | ✅ |

Kiểm thử tự động: **48 vitest + 8 pytest** xanh; typecheck + build sạch.

## Cần bạn làm để chạy thật (1 lần)
Theo [DEPLOY.md](./DEPLOY.md):
- [ ] Tạo Supabase project; chạy migrations `0001` → `0002` → `0003`.
- [ ] Tạo Storage bucket `documents` (private).
- [ ] Chạy `supabase/seed.sql` (org + dự án demo + map mẫu).
- [ ] Auth settings: tắt "Confirm email" khi demo (đăng ký vào thẳng onboarding).
- [ ] Tạo Vercel project, import repo, dán 3 env (URL + anon + service_role).
- [ ] (CI) Thêm `.github/workflows/ci.yml` bằng tài khoản có `workflow` scope —
      YAML mẫu nằm trong DEPLOY.md.

## Nghiệm thu MVP (Definition of Done)
- [ ] Mở URL Vercel khi **chưa đăng nhập** → thấy dự án demo public + bản đồ.
- [ ] Vào `/p/gladia-by-the-water` → thấy facts, talking points, bản đồ tri thức.
- [ ] Đăng ký tài khoản → onboarding tạo org → vào `/app`.
- [ ] (admin) Upload 1 PDF/DOCX dự án → duyệt 5 trường (có nguồn) → publish < 10'.
- [ ] (admin) Tạo vài node + cạnh trong `/app/projects/[slug]/map` → xem ở hub.
- [ ] Tạo bài đăng FB từ learning hub → nội dung không bịa, copy được.
- [ ] Tạo org thứ 2 bằng tài khoản khác → xác nhận **không thấy** dữ liệu org 1 (RLS).
- [ ] Gửi form `/contact` → bản ghi xuất hiện trong bảng `leads`.

## Sau MVP — quyết theo tín hiệu khách (xem MASTER_ROADMAP §10)
- Khách hỏi mua → G14 billing + G5 nạp hàng loạt.
- Sale cần chốt đơn → G11 objection handling + G12 customer-facing mode.
- CĐT lo nói sai → G13 compliance guard.
- Thích trực quan → G8 3D viewer.
