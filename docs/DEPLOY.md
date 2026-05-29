# Deploy & Setup (M0)

Các bước dựng nền cho MVP. Code đã sẵn sàng; phần dưới là việc cần làm trên
Supabase + Vercel (cần bạn cung cấp tài khoản/keys).

## 1. Supabase
1. Tạo project tại https://supabase.com (region gần VN, vd Singapore).
2. **Project Settings → API**, lấy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (server-only, giữ kín)
3. Chạy migrations: mở **SQL Editor**, dán lần lượt nội dung
   `supabase/migrations/0001_init.sql`, `0002_rls.sql`, rồi `0003_project_maps.sql`
   và Run. *(Hoặc dùng Supabase CLI: `supabase db push`.)*
4. **Storage**: tạo bucket `documents` (private) cho M3 upload file.
5. **Seed demo** (tuỳ chọn nhưng nên có): dán `supabase/seed.sql` vào SQL Editor
   và Run — tạo 1 org demo + 5 dự án (1 dự án `public` để trang chủ demo hoạt
   động khi chưa đăng nhập) + bản đồ tri thức mẫu cho Gladia.

## 1b. Engine trích xuất (Python, M3)
- File `api/extract.py` là **Vercel Python Function** (stateless): nhận bytes →
  trả các trường trích xuất. Vercel tự cài `requirements.txt` (pdfplumber,
  python-docx) khi deploy.
- Local dev: `npm run dev` không chạy Python function. Để thử M3 ở local, hoặc
  deploy lên Vercel, hoặc chạy extractor riêng và đặt `EXTRACTOR_URL`.
- Test engine: `python3 -m pytest engine/tests -q`.

## 2. Local dev
```bash
cp .env.example .env.local   # rồi điền 3 giá trị ở trên
npm install
npm run dev                  # http://localhost:3000
```

## 3. Vercel
1. Import repo GitHub vào Vercel (framework tự nhận Next.js).
2. **Settings → Environment Variables**, thêm 3 biến giống `.env.local`.
3. Mỗi PR → Preview Deploy; merge nhánh chính → Production.

## 4. CI
CI (typecheck + test + build) chạy được bằng GitHub Actions. File workflow
(`.github/workflows/ci.yml`) cần được thêm qua tài khoản có `workflow` scope
(PAT hiện tại không có scope này nên chưa commit được). Nội dung workflow mẫu nằm
trong `docs/DEPLOY.md` phần dưới — copy vào `.github/workflows/ci.yml` khi push
bằng tài khoản có quyền.

```yaml
name: CI
on:
  push:
    branches: ["**"]
  pull_request:
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: https://placeholder.supabase.co
          NEXT_PUBLIC_SUPABASE_ANON_KEY: placeholder-anon-key
```

## Kiểm chứng M0 (DoD)
- [ ] `npm run dev` chạy, trang load.
- [ ] Migrations áp dụng, thấy bảng `orgs/profiles/projects/...` trong Supabase.
- [ ] Vercel có URL Production chạy được.
- [ ] CI xanh trên GitHub.
