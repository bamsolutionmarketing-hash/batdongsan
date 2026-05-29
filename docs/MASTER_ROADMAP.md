# Master Roadmap — Batdongsan Knowledge Map

Tài liệu tổng hợp toàn bộ kế hoạch (G0–G14). Đây là **điểm vào trung tâm**; chi
tiết từng mảng nằm ở các doc liên kết bên dưới.

| Doc | Phạm vi |
|---|---|
| [MVP.md](./MVP.md) | **👉 Lát cắt validate trước khi build full — bắt đầu ở đây** |
| [ROADMAP.md](./ROADMAP.md) | Nền tảng, deploy, ingestion rule-based (G0–G6) |
| [CONTENT_ENGINE.md](./CONTENT_ENGINE.md) | Lead-gen content + sales assist (G7) |
| [3D_VIEWER_SPEC.md](./3D_VIEWER_SPEC.md) | Phối cảnh 3D aerial tương tác (G8) |
| (sẽ thêm) | G9–G14: learning hub, khám phá/so sánh, objection, trình khách, compliance, B2B |

---

## 1. Tầm nhìn

**Tool đào tạo & hỗ trợ sale BĐS — biến người chưa biết gì thành người bán được
dự án, nhanh và rẻ.** Mô hình **B2B2C**: sàn/CĐT trả tiền cho cả đội, sale cá
nhân là người dùng.

### Người dùng vs Người trả tiền (định vị thương mại)
| | Sale cá nhân (B2C) | Sàn / CĐT (B2B) |
|---|---|---|
| Vai trò | **Người dùng** — tạo lan toả, phễu acquisition | **Người trả tiền chính** — seat, ký năm |
| Túi tiền | Thu nhập 100% hoa hồng, nhạy giá | Có ngân sách training/marketing |
| Churn | Cao (nhiều người bỏ nghề) | Thấp, sticky (vẫn ở lại khi sale nghỉ) |
| Nỗi đau chính | Chưa biết bán, chưa có khách, chưa chốt được | Ramp-time nhân viên mới lâu & tốn; **sợ sale nói sai/sai luật** |

> **Bài học reverse-engineering:** giá trị "học 1 dự án" và "talking points" phần
> lớn là **một lần** → yếu cho subscription cá nhân. Subscription bền đến từ
> **B2B (sàn/CĐT)** + các **móc lặp lại** (lead-gen content) + **đường nhìn thấy
> tới hoa hồng** (objection handling, chế độ trình khách). Lợi thế **provenance /
> không-hallucinate** chính là điểm bán B2B: CĐT sợ nhất là sale nói sai với khách.

### Cách tạo & giữ giá trị (4 trụ giữ chân + đường tới hoa hồng)
1. **Lead-gen content (móc lặp lại chính)** — nội dung đăng bài/video mới hàng tuần
   để sale ra khách. Nhu cầu lặp → lý do trả tiền tiếp.
2. **Objection handling** — "khách nói X → đáp Y" (rule-based, có nguồn) → giúp **chốt đơn**.
3. **Customer-facing mode** — dùng app (3D, so sánh, fact sheet) **ngay trong buổi
   tư vấn** để trông chuyên nghiệp, thắng deal → gắn thẳng với **thu nhập**.
4. **Compliance guard** — chặn phát ngôn sai luật (cam kết lợi nhuận, sai pháp lý…)
   → điểm bán B2B nhờ provenance.

### Cách đạt được (nền tảng)
- **Sàn/CĐT (hoặc admin) nạp kiến thức** dự án bằng **upload file** → engine
  **Python rule-based** (từ điển + regex, **KHÔNG dùng AI/LLM**) tự gắn tag/category,
  **xác định & giải thích được, không hallucinate**, duyệt trước khi publish.
  *(B2B giải luôn cold-start: khách hàng tự mang data dự án của họ lên.)*
- **Front door = "chọn dự án → mọi thứ để bán ngay"** (không phải force-graph).
  Map trở thành công cụ khám phá/so sánh (G10), không phải màn hình đầu.
- **Sale học & tra cứu**: learning hub từng dự án, hành trình khám phá, 3D aerial.

**Nguyên tắc xuyên suốt:** mọi dữ liệu/đầu ra đều **truy được nguồn gốc**
(provenance), không có thành phần sinh tự do → sale tin được, không bịa với khách.

---

## 2. Kiến trúc tổng (toàn cảnh)

```
   User (xem)   ─▶ ┌──────────────────────────────────────────────┐
   Admin (nạp)  ─▶ │  Next.js (App Router) trên Vercel             │
                   │  - Map force-graph + filter/search (S1/S2)    │
                   │  - Trang chi tiết dự án + 3D viewer (G8)      │
                   │  - Gợi ý nội dung post/video (G7)             │
                   │  - /admin: upload file, duyệt trích xuất      │
                   └───┬───────────────┬───────────────┬──────────┘
          anon+RLS     │               │ signed URL    │ service role (server-only)
                       ▼               ▼               ▼
                ┌───────────────────────────────────────────────┐
                │  Supabase: Postgres + Auth + Storage           │
                │  structured / extractions / tags / templates / │
                │  content_suggestions / project_models / jobs   │
                └───┬───────────────────────────────▲───────────┘
                    │ job                            │ kết quả (provenance)
                    ▼                                │
          ┌──────────────────────┐        ┌─────────┴─────────────┐
          │ Python rule-engine   │        │ Offline (KHÔNG Vercel)│
          │ (Vercel Py Functions)│        │ photogrammetry → .glb │
          │ extract→rules→tag    │        │ gltf-transform tối ưu │
          │ content slot-filling │        └───────────────────────┘
          └──────────────────────┘
                                   3D render: GPU TRÌNH DUYỆT (WebGL/WebGPU)
```

**Vai trò Vercel:** host Next.js + chạy Python Functions nhẹ (rule-engine, cấp
signed URL). **Không** render 3D, **không** photogrammetry, **không** gọi AI.
Chi tiết khả thi 3D: xem [3D_VIEWER_SPEC.md §1](./3D_VIEWER_SPEC.md).

---

## 3. Tech stack (hợp nhất)

| Lớp | Lựa chọn |
|---|---|
| Frontend/SSR | Next.js 14 (App Router, TS, Tailwind) — đã có |
| Map 2D | react-force-graph-2d — đã có |
| 3D | Three.js + @react-three/fiber + drei; glTF/GLB + Draco + KTX2 |
| DB / Auth / Storage | Supabase Postgres + Auth(RLS) + Storage (**không pgvector**) |
| Engine nạp & nội dung | **Python rule-based** (pdfplumber/python-docx/openpyxl, regex, gazetteer) trên Vercel Python Functions |
| Jobs | `ingestion_jobs` + Vercel Cron worker |
| CI/CD | GitHub Actions (lint+typecheck+vitest+pytest+build) + Vercel Git integration |
| AI / LLM | **Không dùng** |

---

## 4. Lộ trình giai đoạn (G0–G14)

| GĐ | Tên | Mục tiêu / DoD | Phụ thuộc | Doc |
|---|---|---|---|---|
| **S1** ✅ | Map + guidance | force-graph + guidance engine (seed) | — | code |
| **S2** ✅ | Filter + search | lọc facet + tìm không dấu, highlight | S1 | code |
| **G0** | Nền tảng & deploy | URL Vercel chạy; Supabase+CI; migrations | S2 | ROADMAP §G0 |
| **G1** | Dữ liệu cấu trúc + public demo | map/filter đọc từ DB; 1 dự án public | G0 | ROADMAP §G1 |
| **G2** | Auth & Admin shell | Supabase Auth + RLS; /admin CRUD | G1 | ROADMAP §G2 |
| **G3** | Upload file + Storage | upload → Storage + `documents` + parse text | G2 | ROADMAP §G3 |
| **G4** ⭐ | Engine rule-based tag/category | đề xuất field kèm nguồn → admin confirm → publish | G3 | ROADMAP §G4 |
| **G5** | Xử lý hàng loạt | `ingestion_jobs` + worker; nạp nghìn dự án nền | G4 | ROADMAP §G5 |
| **G6** | Scale & hardening | phân trang, rate limit, logging, backup | G5 | ROADMAP §G6 |
| **G7** 🎯💰 | Lead-gen content (**móc subscription chính**) | nội dung post/video theo lịch + nhiều biến thể; nhu cầu lặp lại hàng tuần. Kèm pitch/talking points | G4, G9 | CONTENT_ENGINE |
| **G8** 🎯 | 3D aerial viewer | xoay/zoom model dự án, hotspots; dùng cả trong G12 (trình khách) | G1/G2 | 3D_VIEWER_SPEC |
| **G9** 🎯 | Learning hub (trang chi tiết dự án) | trang kiến thức để sale **tự đọc**: facts+nguồn, tài liệu, tiện ích, pháp lý, 3D, talking points. Không quiz | G1/G2 (đủ ở G4) | (sẽ thêm doc) |
| **G10** 🎯 | Hành trình khám phá + so sánh | đào sâu dự án cùng CĐT/khu/phân khúc; **so sánh đối thủ side-by-side** | G1, G9 | (sẽ thêm doc) |
| **G11** 🎯💰 | Objection handling | "khách nói X → gợi ý đáp Y", rule-based có nguồn → giúp chốt đơn | G4 | (sẽ thêm doc) |
| **G12** 🎯💰 | Customer-facing mode | chế độ trình khách: 3D + so sánh + fact sheet gọn, đẹp để dùng khi tư vấn | G8, G9, G10 | (sẽ thêm doc) |
| **G13** 💰🛡️ | Compliance guard | chặn/cảnh báo phát ngôn sai luật (cam kết lợi nhuận, sai pháp lý) trên mọi đầu ra | G7 | (sẽ thêm doc) |
| **G14** 💰 | B2B teams & billing | tổ chức/seat, mời thành viên, white-label CĐT, gói subscription (Stripe), phân tích sử dụng | G2 | (sẽ thêm doc) |

⭐ = trọng tâm dữ liệu. 🎯 = phục vụ sale. 💰 = trực tiếp tạo/giữ doanh thu (móc subscription / B2B). 🛡️ = giảm rủi ro pháp lý. ✅ = đã xong.

---

## 5. Thứ tự thực thi đề xuất

Ưu tiên theo **giá trị thương mại** (sớm có thứ thuyết phục trả tiền), không theo
thứ tự kỹ thuật thuần:

```
NỀN     : G0 ─ G1 ─ G2 ─ G3 ─ G4 ⭐ (knowledge base có nguồn)
GIÁ TRỊ : └─ G9 🎯 ─ G7 🎯💰 ─ G11 🎯💰 ─ G10 🎯 ─ G12 🎯💰 (đường tới hoa hồng)
DOANH THU: └─ G14 💰 (B2B teams/billing) ─ G13 🛡️ (compliance)
SONG SONG: G8 (3D) sau G1/G2 → nhúng vào G9 & G12
VẬN HÀNH : G5 ─ G6 (scale/hardening, khi đã có khách thật)
```

- **G0→G4**: dựng kho tri thức có provenance (điều kiện cần, chưa bán được gì).
- **G9→G7→G11→G10→G12**: chuỗi tạo giá trị *nhìn thấy được* cho sale — học dự án →
  nội dung ra khách (móc lặp lại) → chốt đơn → so sánh đối thủ → trình khách thắng deal.
- **G14 + G13**: biến giá trị thành **doanh thu bền** (B2B seat/ký năm) và **an toàn
  pháp lý** (điểm bán B2B). Nên làm sớm khi đã có 1–2 khách B2B thử nghiệm.
- **MVP bán được đề xuất:** G0–G4 + **G9 + G7 + G14** (kho tri thức + trang học +
  lead-gen lặp lại + thu tiền theo team). Đây là lát cắt nhỏ nhất *thuyết phục
  được sàn/CĐT trả tiền*. Các trụ còn lại (G11/G10/G12/G13) tăng giữ chân sau đó.

---

## 6. Mô hình dữ liệu — bảng theo giai đoạn

| Bảng | Xuất hiện ở | Vai trò |
|---|---|---|
| `projects`, `relations` | G1 | dữ liệu cấu trúc + cạnh map |
| `profiles` | G2 | role admin/user |
| `documents` | G3 | file đã upload |
| `extractions`, `tags`, `project_tags` | G4 | kết quả rule-based + provenance |
| `ingestion_jobs` | G5 | hàng đợi xử lý lô |
| `content_templates`, `content_suggestions` | G7 | template lead-gen/pitch/talking points + đầu ra |
| `project_models`, `model_hotspots` | G8 | model 3D + điểm tương tác |
| `selling_points`, `comparisons` (dự kiến) | G9/G10 | điểm bán hàng & so sánh đối thủ (suy ra bằng rule) |
| `objections` (dự kiến) | G11 | cặp "câu từ chối → cách đáp" có nguồn |
| `compliance_rules`, `content_flags` (dự kiến) | G13 | luật phát ngôn + cờ vi phạm trên đầu ra |
| `orgs`, `memberships`, `subscriptions` (dự kiến) | G14 | tổ chức/seat/gói + tích hợp billing |

Chi tiết DDL: ROADMAP §3, CONTENT_ENGINE §3, 3D_VIEWER_SPEC §3.

---

## 7. Cấu trúc repo (đích)

```
/app            Next.js App Router (UI, route handlers, /admin)
                  · /project/[slug]  learning hub (G9)
                  · /explore         hành trình khám phá + so sánh (G10)
/components     map (force-graph) · viewer3d · filter · sales (talking points)
/lib            transform · filter · guidance (hàm thuần TS) — đã có
/engine         Python rule-based: ingestion + sales-assist (pytest)
/supabase       migrations · seed · policies (RLS)
/scripts        gltf-transform (tối ưu model 3D, chạy offline/CI)
/docs           MASTER_ROADMAP · ROADMAP · CONTENT_ENGINE · 3D_VIEWER_SPEC
```

---

## 8. Env / secrets (đặt ở Vercel + GitHub Actions, KHÔNG commit)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # server-only: engine, worker, signed URL
```
> Không cần key AI nào (kiến trúc rule-based + render client-side).

---

## 9. Bất biến kiến trúc (giữ qua mọi giai đoạn)
1. **Không AI sinh tự do** — rule-based + template + provenance.
2. **Hàm thuần tách khỏi nguồn dữ liệu** (`transform`/`filter`/`guidance`) → đổi
   nguồn không sửa logic; test được.
3. **Việc nặng làm bất đồng bộ/offline** (batch ingestion qua jobs; photogrammetry
   ngoài Vercel). Vercel function chỉ làm việc nhẹ.
4. **Provenance bắt buộc** — mọi field/đầu ra truy được về nguồn; thiếu dữ liệu thì
   báo missing, không bịa.
5. **Public tối thiểu** — chỉ dự án `visibility='public'` lộ ra ngoài; còn lại sau auth.
6. **Multi-tenant từ đầu** — dữ liệu cô lập theo tổ chức (org) qua RLS; sàn A không
   thấy dữ liệu riêng của sàn B. (Bắt buộc cho B2B; thiết kế schema có `org_id`
   ngay từ G2 để khỏi refactor về sau.)

---

## 10. Quyết định đã chốt & còn mở
**Đã chốt:**
- **Mục tiêu: sale enablement, mô hình B2B2C.** Người dùng = sale cá nhân (phễu);
  **người trả tiền chính = sàn/CĐT** (seat, ký năm). B2B giải cold-start (khách
  tự mang data dự án lên).
- **Móc giữ chân & doanh thu (đều thuộc lõi):** G7 lead-gen content (móc lặp lại
  chính), G11 objection handling, G12 customer-facing mode, G13 compliance guard,
  G14 B2B teams/billing.
- **Đổi front door** → "chọn dự án → mọi thứ để bán ngay"; force-graph thành công
  cụ khám phá/so sánh (G10), không phải màn hình đầu.
- **G9 là trang đọc tĩnh** — kiến thức + talking points để sale tự đọc; KHÔNG
  quiz/gamification (giữ nhẹ).
- Không RAG/không AI API · nguồn nạp = upload file · public 1 dự án demo + auth ·
  Python chạy **Vercel Python Functions** · 3D render client-side.
- **MVP bán được:** G0–G4 + G9 + G7 + G14.

**Còn mở:** (a) OCR brochure ảnh ở G4 hay G6; (b) worker Python riêng nếu batch
nặng; (c) nguồn được phép thu thập (pháp lý); (d) cổng thanh toán (Stripe vs nội
địa VN) cho G14; (e) mức độ white-label cho CĐT ở G14.
