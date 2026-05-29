# Roadmap — Batdongsan Knowledge Map

Chia triển khai thành các **giai đoạn (G0–G6)**, mỗi giai đoạn deploy được và có
Definition of Done rõ ràng. Mục tiêu: **mở rộng tới hàng nghìn dự án**, admin nạp
kiến thức bằng **upload file**, xử lý bằng **engine Python rule-based** (từ điển +
regex, **không dùng AI/LLM API**) để tự gắn tag/category một cách **xác định và
giải thích được — không hallucinate**.

## Quyết định nền tảng (đã chốt)
- **Không RAG, không gọi API AI.** Toàn bộ trích xuất/tag/phân loại là **rule-based
  thuần Python** (deterministic, có nguồn gốc từng trường → audit được).
- **Người nạp duy nhất là admin.** User thường chỉ **xem**. Không có chat AI.
- **Nguồn nạp: upload file** (PDF / DOCX / XLSX / ảnh-brochure có text).
- **Auth:** có Supabase Auth + admin; đồng thời **1 dự án demo để public**.

---

## 1. Kiến trúc tổng thể

```
        User (xem)   ─▶ ┌───────────────────────────────────────────┐
        Admin (nạp)  ─▶ │  Next.js (App Router) trên Vercel          │
                        │  - UI map + filter (S1/S2 đã có)           │
                        │  - /admin: upload file, duyệt trích xuất   │
                        │  - Route Handlers / Server Actions         │
                        └──────┬───────────────────────┬────────────┘
                  anon+RLS     │                        │ service role (server-only)
                               ▼                        ▼
                        ┌───────────────────────────────────────────┐
                        │  Supabase (Postgres + Auth + Storage)      │
                        │  - projects, relations (structured)        │
                        │  - documents, extractions, tags            │
                        │  - ingestion_jobs (hàng đợi)              │
                        │  - Storage: file upload                    │
                        │  - Auth + RLS (admin write / public read)  │
                        └──────┬───────────────────────▲────────────┘
                               │ job                    │ upsert kết quả
                               ▼                        │
                        ┌───────────────────────────────────────────┐
                        │  Python Ingestion Engine (rule-based)      │
                        │  extract text → normalize → RULES:         │
                        │   • gazetteer (quận, CĐT, tiện ích)        │
                        │   • regex (giá, diện tích, pháp lý, ngày)  │
                        │   • classifier rule (segment, category)    │
                        │  → trích xuất kèm rule_id + vị trí nguồn   │
                        └───────────────────────────────────────────┘
```

**Vì sao không hallucinate:** mỗi trường trích xuất ghi lại **rule nào** sinh ra +
**đoạn văn bản nguồn** (source span) + độ tin cậy. Admin **duyệt/sửa** trước khi
publish. Không có mô hình sinh tự do → không bịa dữ liệu.

**Mở rộng tới hàng nghìn dự án:** mỗi file upload tạo 1 bản ghi `ingestion_jobs`;
**worker Python** rút lô, chạy engine, ghi kết quả — bất đồng bộ, không nghẽn
request. Engine là hàm thuần → test bằng `pytest`, thêm rule mới không phá luồng.

---

## 2. Tech stack

| Lớp | Lựa chọn | Ghi chú |
|---|---|---|
| Frontend/SSR | Next.js 14 (App Router, TS, Tailwind) | đã có (S1/S2) |
| Map | react-force-graph-2d | đã có |
| DB | Supabase Postgres | structured, **không cần pgvector** |
| Auth | Supabase Auth + RLS | admin / public read |
| Storage | Supabase Storage | file upload |
| Engine nạp | **Python** (rule-based): `pdfplumber`/`python-docx`/`openpyxl`, `regex`, từ điển | không AI |
| Chạy Python | Vercel Python Functions (light) + worker cron rút `ingestion_jobs` | xem mục 7 |
| CI/CD | GitHub Actions + Vercel Git integration | preview mỗi PR, prod ở `main` |
| Test | Vitest (TS) + **pytest** (engine Python) | |

> Engine Python **không phụ thuộc Next.js**; giao tiếp qua Supabase (đọc job, ghi
> kết quả). Có thể chạy như Vercel Python Function hoặc worker riêng (mục 7).

---

## 3. Mô hình dữ liệu (Supabase)

```sql
projects(
  id uuid pk, slug text unique, name text, developer text,
  district text, city text, segment text, status text,
  price_per_sqm_m numeric, attributes jsonb,
  visibility text default 'private',     -- 'public' cho dự án demo
  created_at, updated_at)

relations(                               -- cạnh map (suy ra bằng rule)
  project_id uuid fk, related_project_id uuid fk,
  reason text, weight numeric, primary key(project_id, related_project_id))

documents(                               -- file đã upload
  id uuid pk, project_id uuid fk, storage_path text,
  filename text, mime text, content_hash text,   -- dedupe/idempotent
  status text, created_at)                        -- pending|parsed|error

extractions(                             -- KẾT QUẢ rule-based, audit được
  id uuid pk, document_id uuid fk, project_id uuid fk,
  field text, value text,                -- vd field='price', value='160'
  rule_id text, source_span text,        -- nguồn gốc để kiểm chứng
  confidence numeric, status text)       -- suggested|confirmed|rejected

tags(id uuid pk, name text unique, kind text)        -- kind: category|amenity|...
project_tags(project_id uuid fk, tag_id uuid fk, primary key(project_id, tag_id))

ingestion_jobs(
  id uuid pk, document_id uuid fk, status text,
  attempts int, last_error text, created_at, updated_at)

profiles(user_id uuid pk -> auth.users, role text)   -- 'admin' | 'user'
```

**RLS:**
- `projects/relations/tags`: ai cũng **read** dòng `visibility='public'`; read đầy
  đủ + write chỉ `role='admin'`.
- `documents/extractions/ingestion_jobs`: chỉ admin / service role.

---

## 4. Engine Python rule-based (xương sống mở rộng)

```python
# Thuần, deterministic, test bằng pytest. Thêm nguồn/loại file = thêm extractor.
def extract_text(path, mime) -> str          # pdf/docx/xlsx/image-OCR(optional)
def normalize(text) -> str                   # dọn whitespace, content_hash

# RULES — mỗi rule có id, trả về (value, source_span, confidence):
GAZETTEERS = {                               # từ điển có sẵn, mở rộng dễ
  "district":  [...],  "developer": [...],
  "amenity":   [...],  "segment_keywords": {...},
}
REGEX_RULES = {                              # giá, diện tích, số căn, pháp lý, ngày
  "price_per_sqm": r"...", "area": r"...", "legal": r"...", ...
}

def run_rules(text) -> list[Extraction]      # gom kết quả mọi rule
def classify_segment(text) -> Extraction     # rule keyword → luxury/high-end/...
def derive_tags(text) -> list[str]           # amenity/category theo từ điển
```

- **Audit:** mỗi `Extraction` mang `rule_id` + `source_span` → admin truy vết được.
- **Mở rộng:** thêm quận/CĐT/tiện ích vào gazetteer, thêm regex — không sửa luồng.
- **Relations** suy ra bằng rule (cùng CĐT / quận / phân khúc) — tái dùng logic
  `transform.ts` đã có ở phía TS hoặc nhân bản trong engine.

---

## 5. Các giai đoạn

### G0 — Nền tảng & đường deploy  *(làm trước tiên)*
- Tạo Supabase + Vercel project, nối GitHub (auto preview/prod).
- `supabase/migrations` + Supabase CLI; GitHub Actions CI: `lint+typecheck+vitest+build`.
- Deploy app hiện tại (seed in-memory) lên Vercel.
- **DoD:** có URL Vercel chạy được; CI xanh.

### G1 — Lớp dữ liệu cấu trúc + public demo
- Migration `projects`+`relations`; seed Masteri/Gladia vào DB; 1 dự án `visibility='public'`.
- Đọc map/filter từ DB; giữ nguyên `transform`/`filter`/`guidance` (hàm thuần).
- RLS: public chỉ thấy dự án public.
- **DoD:** map+filter render từ Supabase; khách vãng lai thấy đúng dự án demo.

### G2 — Auth & Admin shell
- Supabase Auth + `profiles.role`; RLS admin-write / public-read.
- `/admin` được bảo vệ; CRUD dự án (structured) qua form.
- **DoD:** admin đăng nhập tạo/sửa dự án; public không sửa được.

### G3 — Upload file + lưu trữ
- Supabase Storage + bảng `documents`; UI admin upload file cho 1 dự án.
- Trích xuất text (PDF/DOCX/XLSX) trong engine Python (chưa cần tag).
- **DoD:** upload file → lưu Storage + `documents`, đọc ra được text.

### G4 — Engine rule-based tag/category  *(trọng tâm)*
- Gazetteer + regex + classifier; bảng `extractions` + `tags`.
- UI admin **duyệt/sửa** trường trích xuất trước khi publish (mỗi trường có nguồn).
- pytest cho từng rule; relations suy ra bằng rule.
- **DoD:** upload file 1 dự án → engine đề xuất giá/quận/CĐT/phân khúc/tag kèm
  nguồn; admin confirm → dữ liệu structured + tag được publish.

### G5 — Xử lý hàng loạt (nghìn dự án)
- `ingestion_jobs` + worker cron rút lô; dedupe theo `content_hash`; retry backoff.
- Upload nhiều file / nhiều dự án; theo dõi tiến độ job.
- **DoD:** nạp hàng loạt nhiều dự án chạy nền, không timeout.

### G6 — Scale & hardening
- Phân trang, rate limit, logging/observability, backup; tinh chỉnh hiệu năng query.
- (Tùy chọn) OCR cho brochure ảnh; mở rộng gazetteer quy mô lớn.
- **DoD:** vận hành ổn định ở quy mô nghìn dự án.

---

## 6. Mapping với việc đã làm
- **S1** (map + guidance) và **S2** (filter/search) chạy trên seed in-memory →
  thành phần UI của G0/G1, **không vứt đi**.
- `transform`/`filter`/`guidance` là hàm thuần, tách khỏi nguồn dữ liệu → G1 chỉ
  đổi nguồn (seed → Supabase), không sửa logic.

---

## 7. Thiết lập deploy & quyết định còn mở
**Secrets / env (đặt ở Vercel + GitHub Actions, KHÔNG commit):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-only, cho engine/worker
```
> Không cần key AI nào (kiến trúc rule-based).

**Quyết định còn mở:**
1. **Chạy Python ở đâu:** (a) **Vercel Python Functions** trong cùng repo (đơn
   giản, hợp file lẻ; có giới hạn size/timeout) vs (b) **worker Python riêng**
   (Railway/Render/Fly) cho batch nặng. Đề xuất bắt đầu (a), lên (b) ở G5 nếu cần.
2. **OCR brochure ảnh:** có cần ở G4 hay để G6 (tùy chất lượng file đầu vào).
3. **Cấu trúc repo:** monorepo `app/` (Next.js) + `engine/` (Python + pytest).
