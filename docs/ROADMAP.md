# Roadmap — Batdongsan Knowledge Map

Tài liệu này chia việc triển khai thành các **giai đoạn (G0–G6)**, mỗi giai đoạn
deploy được và có Definition of Done rõ ràng. Mục tiêu kiến trúc: **mở rộng tới
hàng nghìn dự án**, mỗi dự án nạp được kiến thức từ nhiều nguồn (form / file /
URL / bulk-API), vừa dữ liệu **có cấu trúc** vừa **RAG hỏi đáp AI**.

---

## 1. Kiến trúc tổng thể

```
                         ┌──────────────────────────────────────────┐
        Người dùng ───▶  │  Next.js (App Router) trên Vercel         │
        Admin      ───▶  │  - UI map + filter + chat hỏi đáp         │
                         │  - /admin: CRUD dự án + nạp kiến thức     │
                         │  - Route Handlers / Server Actions        │
                         └───────┬───────────────────────┬──────────┘
                                 │ (anon key, RLS)        │ (service role, server-only)
                                 ▼                        ▼
                         ┌──────────────────────────────────────────┐
                         │  Supabase (Postgres + pgvector + Auth)    │
                         │  - projects, relations (structured)       │
                         │  - documents, chunks(embedding) (RAG)     │
                         │  - ingestion_jobs (hàng đợi)              │
                         │  - Storage (file upload)                  │
                         │  - Auth + RLS (admin/user)                │
                         └───────┬───────────────────────▲──────────┘
                                 │                        │
              ┌──────────────────▼───────┐     ┌──────────┴───────────────┐
              │ Ingestion Worker         │     │ AI Providers             │
              │ (Vercel Cron / Edge fn)  │     │ - Claude: hỏi đáp/guidance│
              │ adapters→extract→chunk   │────▶│ - Voyage: embeddings      │
              │ →embed→upsert            │     └──────────────────────────┘
              └──────────────────────────┘
```

**Nguyên tắc mở rộng:** mọi nguồn nạp đều đi qua **một pipeline chung** với
*Source Adapter* cắm-rút được; thêm nguồn mới = thêm 1 adapter, không đụng phần
extract/chunk/embed/store. Nạp số lượng lớn chạy **bất đồng bộ qua hàng đợi
`ingestion_jobs`** nên không phụ thuộc thời gian request.

---

## 2. Tech stack

| Lớp | Lựa chọn | Ghi chú |
|---|---|---|
| Frontend/SSR | Next.js 14 (App Router, TS, Tailwind) | đã có từ S1/S2 |
| Map | react-force-graph-2d | đã có |
| DB | Supabase Postgres + **pgvector** | structured + vector trong 1 DB |
| Auth | Supabase Auth + RLS | admin / user |
| Storage | Supabase Storage | file upload |
| Embeddings | **Voyage AI** `voyage-3` (1024-dim) | Anthropic khuyến nghị; dim cố định khớp cột vector |
| LLM | **Claude** (Sonnet cho hỏi đáp, Opus khi cần sâu) | RAG answer + guidance |
| Jobs | Vercel Cron + Route Handler worker (nâng cấp pgmq/Inngest sau) | xử lý hàng đợi |
| CI/CD | GitHub Actions + Vercel Git integration | preview mỗi PR, prod ở `main` |

> Embeddings/LLM provider để **cấu hình qua biến môi trường** — đổi nhà cung cấp
> không phải sửa pipeline. Nếu muốn 1 provider duy nhất có thể dùng OpenAI
> embeddings; mặc định đề xuất Voyage + Claude.

---

## 3. Mô hình dữ liệu (Supabase)

```sql
-- structured
projects(
  id uuid pk, slug text unique, name text, developer text,
  district text, city text, segment text, status text,
  price_per_sqm_m numeric, attributes jsonb,        -- field linh hoạt
  created_at, updated_at)

relations(                                            -- cạnh của map
  project_id uuid fk, related_project_id uuid fk,
  reason text, weight numeric, primary key(project_id, related_project_id))

-- RAG
documents(
  id uuid pk, project_id uuid fk, source_type text,  -- manual|file|url|bulk
  source_ref text, title text, mime text,
  storage_path text, content_hash text,              -- dedupe/idempotent
  status text, created_at)                            -- pending|done|error

chunks(
  id uuid pk, document_id uuid fk, project_id uuid fk,
  content text, token_count int,
  embedding vector(1024), metadata jsonb)
-- index: HNSW on embedding (vector_cosine_ops)

-- jobs
ingestion_jobs(
  id uuid pk, source_type text, payload jsonb,
  status text, attempts int, last_error text,
  created_at, updated_at)                             -- queued|running|done|failed

-- auth
profiles(user_id uuid pk -> auth.users, role text)   -- 'admin' | 'user'
```

**RLS:** `projects/relations/documents/chunks` → public **read**, write chỉ
`role='admin'`. `ingestion_jobs` chỉ truy cập qua service role (server). Vector
search qua RPC `match_chunks(query_embedding, project_id?, k)` (SECURITY DEFINER).

---

## 4. Pipeline nạp kiến thức (xương sống mở rộng)

```ts
interface SourceAdapter {
  type: 'manual' | 'file' | 'url' | 'bulk';
  // Trả về danh sách tài liệu thô + metadata, không quan tâm bước sau.
  collect(payload): AsyncIterable<RawDocument>;
}

// Pipeline dùng chung cho MỌI adapter:
RawDocument
  → extractText(mime)        // pdf/docx/xlsx/html/text → text
  → normalize()              // dọn whitespace, dedupe theo content_hash
  → chunk(tokenAware)        // ~500 token, overlap 50
  → embedBatch(Voyage)       // gọi theo lô, có cache theo hash
  → upsert(documents,chunks) // idempotent theo content_hash
```

- Thêm nguồn mới (vd Zalo, API đối tác) = viết 1 adapter `collect()`.
- Bulk/API: đẩy item vào `ingestion_jobs`; worker (cron) rút lô, chạy pipeline,
  retry có backoff → nạp **hàng nghìn dự án** không nghẽn request.

---

## 5. Các giai đoạn

### G0 — Nền tảng & đường deploy  *(làm trước tiên)*
- Tạo Supabase project + Vercel project, nối GitHub repo (auto preview/prod).
- Biến môi trường + `supabase/migrations` + Supabase CLI.
- GitHub Actions CI: `lint + typecheck + vitest + build` trên mỗi PR.
- Deploy app hiện tại (seed in-memory) lên Vercel.
- **DoD:** có URL Vercel chạy được; CI xanh; migration rỗng apply được.

### G1 — Lớp dữ liệu cấu trúc
- Migration `projects` + `relations`; seed Masteri/Gladia vào DB.
- Repository layer (server) + đọc map/filter từ DB (Server Components/RPC).
- RLS public read.
- **DoD:** map + filter render từ Supabase, không còn phụ thuộc seed.ts.

### G2 — Auth & Admin
- Supabase Auth + `profiles.role`; RLS admin-write / public-read.
- `/admin` được bảo vệ; CRUD dự án (structured) qua form.
- **DoD:** admin tạo/sửa dự án → user thấy ngay; user thường không sửa được.

### G3 — Lõi ingestion (RAG spine)
- Migration `documents` + `chunks` (pgvector) + RPC `match_chunks` + HNSW index.
- Pipeline + `SourceAdapter` interface; nguồn **manual/form** trước.
- `ingestion_jobs` + worker cron + idempotent theo `content_hash`.
- **DoD:** dán text cho 1 dự án → tạo chunks có embedding, search vector trả về.

### G4 — RAG hỏi đáp
- Vector search → ghép context → **Claude** trả lời **kèm trích dẫn nguồn**.
- UI chat theo từng dự án; guidance engine bổ sung dữ kiện từ chunks.
- **DoD:** hỏi về 1 dự án → câu trả lời có dẫn nguồn document.

### G5 — Mở rộng nguồn nạp
- **File upload** (PDF/DOCX/XLSX → Storage + extract).
- **URL scraping** adapter (trang CĐT, batdongsan.com.vn…).
- **Bulk CSV/JSON + API endpoint** đẩy vào hàng đợi; embed theo lô.
- **DoD:** import hàng loạt nhiều dự án qua 1 lần, chạy nền, không timeout.

### G6 — Scale & hardening
- Tinh chỉnh HNSW, phân trang, rate limit, cache embedding, logging/observability.
- Kiểm soát chi phí AI; backup; load test với N nghìn dự án.
- **DoD:** vận hành ổn định ở quy mô nghìn dự án.

---

## 6. Thiết lập deploy (cần bạn cung cấp khi tới G0)

**Secrets / env (đặt ở Vercel + GitHub Actions, KHÔNG commit):**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only
ANTHROPIC_API_KEY=                # Claude
VOYAGE_API_KEY=                   # embeddings (hoặc OPENAI_API_KEY nếu đổi)
```
- GitHub: bật Vercel app → mỗi PR có Preview Deploy, merge `main` → Production.
- Supabase: project mới (region gần VN, vd Singapore); bật extension `vector`.
- Migrations chạy bằng Supabase CLI trong GitHub Action (hoặc thủ công lúc đầu).

---

## 7. Quyết định còn mở
1. Embeddings provider: **Voyage (đề xuất)** vs OpenAI — chốt 1 để cố định số
   chiều cột `vector(...)` (Voyage-3 = 1024, OpenAI text-embedding-3-small = 1536).
2. Worker hàng đợi: bắt đầu **Vercel Cron + bảng jobs** (đơn giản), nâng lên
   **pgmq/Inngest** khi tải lớn.
3. Storage/scraping pháp lý: chốt nguồn được phép crawl.
```
```

---

## 8. Mapping với việc đã làm
- **S1** (force-graph map + guidance engine) và **S2** (filter/search) đã xong,
  chạy trên seed in-memory → trở thành phần UI của G0/G1, không vứt đi.
- G1 thay nguồn dữ liệu seed bằng Supabase nhưng giữ nguyên `transform`/`filter`/
  `guidance` (đều là hàm thuần, tách khỏi nguồn dữ liệu).
