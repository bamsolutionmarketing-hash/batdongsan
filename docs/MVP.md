# MVP Spec — Validate trước khi build full

> Mục tiêu: có **sản phẩm chạy thật trên Vercel** để đưa cho 1–2 sàn/CĐT dùng thử
> và trả lời câu hỏi sống còn: **"Sàn/CĐT có chịu trả tiền cho cái này không?"**
> — *trước khi* đổ công xây toàn bộ G0–G14.
>
> Tổng quan toàn bộ lộ trình: [MASTER_ROADMAP.md](./MASTER_ROADMAP.md).

---

## 1. Giả thuyết cần kiểm chứng

| # | Giả thuyết | Tín hiệu xác nhận |
|---|---|---|
| H1 | Sàn/CĐT thấy đủ giá trị để **trả tiền theo team** | Họ nói "muốn dùng cho cả đội", hỏi giá |
| H2 | **Lead-gen content** là thứ sale quay lại dùng hàng tuần | Sale tạo nội dung nhiều lần trong tuần đầu |
| H3 | Upload file → tự rút dữ liệu **đủ tốt** để admin chỉ cần sửa nhẹ | Admin duyệt 1 dự án < 10 phút |
| H4 | Lợi thế **không bịa / có nguồn** được CĐT coi trọng | Họ nhắc tới lo ngại "sale nói sai" |

MVP **không** nhằm hoàn thiện tính năng — nhằm **lấy tín hiệu mua** sớm nhất.

---

## 2. Phạm vi MVP (chốt)

**Người trả tiền:** bán tay (chưa tích hợp cổng thanh toán).
**Nạp dữ liệu:** có engine upload file (tối giản) + **luôn có bước admin duyệt**.

### IN — MVP làm
1. **Nền deploy** (G0): Next.js trên Vercel + Supabase (Postgres/Auth/Storage) + CI.
2. **Multi-tenant tối thiểu** (org_id + RLS): mỗi sàn = 1 org, dữ liệu cô lập.
3. **Auth + 2 vai trò**: `admin` (nạp/duyệt) và `member` (sale, xem/dùng).
4. **Upload file → engine rule-based tối giản**: PDF/DOCX → text → rút **5 trường
   cốt lõi** (giá/m², vị trí-quận, chủ đầu tư, phân khúc, tiện ích) + **màn admin
   duyệt/sửa** mỗi trường (kèm nguồn). Đây là G3+G4 ở mức tối giản.
5. **Learning hub** (G9): trang chi tiết dự án để sale tự đọc (facts + nguồn).
6. **Lead-gen content** (G7 lõi): từ facts → sinh **bài đăng FB + caption ngắn**
   theo 2–3 template (slot-filling, có nguồn, báo thiếu nếu thiếu fact).
7. **Map + filter** (S1/S2 đã có) gắn vào, đọc từ DB.
8. **Trang "Liên hệ mua / Đăng ký dùng thử"** (bán tay): form thu lead, hiện khái
   niệm team/seat — KHÔNG xử lý thanh toán.

### OUT — để sau MVP (chỉ làm nếu khách gật)
- Engine nạp file đầy đủ (XLSX, OCR ảnh, nhiều trường, xử lý hàng loạt G5).
- 3D viewer (G8), objection handling (G11), customer-facing mode (G12),
  compliance guard (G13), billing tự động/Stripe (G14 đầy đủ).
- So sánh đối thủ nâng cao (G10), video script dài, lịch đăng bài.

> **Vì sao cắt mạnh:** mỗi tính năng OUT tốn nhiều ngày. Nếu khách không mua MVP,
> xây chúng là lãng phí. Nếu khách mua, ta biết chính xác xây cái nào trước.

---

## 3. Engine nạp file — mức MVP (tối giản, có chủ đích)

```
upload (.pdf/.docx)
  → extract_text   (pdfplumber / python-docx)
  → run_rules      CHỈ 5 trường cốt lõi:
       price_per_sqm  (regex: "… tr/m²", "triệu/m2", …)
       district       (gazetteer quận/khu — danh sách khởi tạo cho TP.HCM)
       developer      (gazetteer CĐT lớn + fallback: cụm in hoa lặp lại)
       segment        (keyword: "hạng sang/cao cấp/…" → luxury/high-end/…)
       amenities      (gazetteer tiện ích: hồ bơi, gym, công viên, …)
  → mỗi trường trả (value, source_span, confidence)
  → LƯU dạng "suggested" → ADMIN DUYỆT/SỬA → "confirmed" → publish
```

Nguyên tắc MVP:
- **Rule bắt hụt là chấp nhận được** — admin sửa tay bù vào. Mục tiêu là *giảm
  công nhập liệu*, không phải tự động 100%.
- **Mỗi trường luôn kèm nguồn** (đoạn text gốc) để admin kiểm nhanh → đo H3.
- Chạy **đồng bộ** trong 1 request (1 file/lần) — chưa cần hàng đợi `ingestion_jobs`.
- Chạy trên **Vercel Python Function**; nếu file lớn/timeout → cắt bớt, để batch sau.

---

## 4. Mô hình dữ liệu MVP (subset)

```sql
orgs(id uuid pk, name text, created_at)

profiles(user_id uuid pk -> auth.users,
         org_id uuid fk, role text)            -- 'admin' | 'member'

projects(id uuid pk, org_id uuid fk, slug text,
         name, developer, district, city,
         segment, status, price_per_sqm_m numeric,
         attributes jsonb,                      -- amenities[], highlights[]
         visibility text default 'org',         -- 'org' | 'public' (1 dự án demo)
         created_at, updated_at)

documents(id uuid pk, org_id uuid fk, project_id uuid fk,
          storage_path, filename, mime, content_hash,
          status text, created_at)              -- pending|parsed|error

extractions(id uuid pk, org_id uuid fk, document_id uuid fk, project_id uuid fk,
            field text, value text,
            source_span text, confidence numeric,
            status text)                         -- suggested|confirmed|rejected

content_suggestions(id uuid pk, org_id uuid fk, project_id uuid fk,
                    format text,                 -- facebook_post | short_caption
                    rendered jsonb, used_facts jsonb, missing_slots text[],
                    status text, edited_body text, created_at)

leads(id uuid pk, org_name text, contact text,
      message text, seats int, created_at)       -- form "liên hệ mua"
```

**RLS (bắt buộc từ MVP):** mọi bảng có `org_id` → chỉ thành viên cùng org đọc/ghi;
`projects.visibility='public'` cho phép đọc ẩn danh (dự án demo). `leads` chỉ
service role / superadmin.

> Schema có `org_id` ngay từ đầu → khi mở rộng B2B không phải refactor.

---

## 5. Luồng người dùng (demo path)

**Admin sàn (onboarding):**
```
Đăng nhập → tạo org → Upload PDF dự án → engine rút 5 trường (kèm nguồn)
 → duyệt/sửa nhanh → Publish → dự án xuất hiện cho cả team
```

**Sale (giá trị hằng ngày):**
```
Mở app → FRONT DOOR: chọn dự án → Learning hub (đọc facts + nguồn)
 → tab "Nội dung" → bấm tạo → ra bài FB + caption (có nguồn) → copy đăng
```

**Người mua tiềm năng (validate):**
```
Xem dự án demo public → thấy giá trị → bấm "Liên hệ mua cho team" → để lại lead
```

---

## 6. Lộ trình MVP (các bước build)

| Bước | Nội dung | DoD |
|---|---|---|
| M0 | G0 nền deploy: Vercel + Supabase + CI; migrations subset §4 | URL chạy, CI xanh |
| M1 | Auth + org + RLS multi-tenant; profiles/role | 2 org tách biệt dữ liệu |
| M2 | CRUD project (form) + map/filter đọc từ DB | sale thấy dự án của org |
| M3 | Upload file + Storage + Python extract 5 trường + màn duyệt | upload→duyệt→publish < 10' |
| M4 | Learning hub (trang chi tiết, facts + nguồn) | sale đọc đủ 1 dự án |
| M5 | Lead-gen content (2–3 template, slot-filling, copy) | tạo bài FB có nguồn |
| M6 | Front door "chọn dự án → bán ngay" + trang Liên hệ mua | lead form chạy |
| M7 | Seed 2–3 dự án thật + 1 dự án public demo + polish | sẵn sàng đưa khách |

> Thứ tự ưu tiên nếu phải cắt tiếp: **M3 + M5** là 2 thứ chứng minh giá trị mạnh
> nhất (tự rút data + nội dung lặp lại). M0–M2 là nền bắt buộc.

---

## 7. Tiêu chí "MVP xong & sẵn sàng validate"
- [ ] Deploy thật trên Vercel, ai có link + tài khoản đều dùng được.
- [ ] 1 sàn demo: admin upload được PDF thật → publish dự án trong < 10 phút.
- [ ] Sale tạo được bài đăng FB từ dự án, nội dung **không có thông tin bịa**
      (mọi số liệu truy được về nguồn).
- [ ] Dữ liệu 2 org tách biệt (test RLS).
- [ ] Có dự án public demo cho người chưa đăng nhập xem.
- [ ] Form "Liên hệ mua" thu được lead.

## 8. Sau MVP — quyết theo tín hiệu
- Khách hỏi mua → ưu tiên **G14 billing** + **G5 nạp hàng loạt** (nhiều dự án).
- Sale kêu "cần chốt đơn" → **G11 objection** + **G12 customer-facing**.
- CĐT lo nói sai → **G13 compliance**.
- Khen 3D/trực quan → **G8 3D viewer**.
