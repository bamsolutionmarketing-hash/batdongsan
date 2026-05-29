# Master Roadmap — Batdongsan Knowledge Map

Tài liệu tổng hợp toàn bộ kế hoạch (G0–G8). Đây là **điểm vào trung tâm**; chi
tiết từng mảng nằm ở các doc liên kết bên dưới.

| Doc | Phạm vi |
|---|---|
| [ROADMAP.md](./ROADMAP.md) | Nền tảng, deploy, ingestion rule-based (G0–G6) |
| [CONTENT_ENGINE.md](./CONTENT_ENGINE.md) | Gợi ý nội dung đăng bài / video (G7) |
| [3D_VIEWER_SPEC.md](./3D_VIEWER_SPEC.md) | Phối cảnh 3D aerial tương tác (G8) |

---

## 1. Tầm nhìn

**Tool đào tạo & hỗ trợ sale BĐS — biến người chưa biết gì thành người bán được dự án, nhanh và rẻ.**

Đối tượng & giá trị:
- **Sale mới / chưa biết tư vấn** — con đường ngắn nhất để bắt đầu bán một dự án:
  hiểu dự án, biết **nói gì với khách**, biết **dự án mạnh ở đâu so với đối thủ**.
- **Chủ đầu tư / sàn** — **rút ngắn thời gian training** nhân viên mới với chi phí
  cực thấp; chuẩn hoá kiến thức dự án cho cả đội.

Cách đạt được:
- **Admin nạp kiến thức** dự án bằng **upload file** → engine **Python rule-based**
  (từ điển + regex, **KHÔNG dùng AI/LLM**) tự gắn tag/category, **xác định &
  giải thích được, không hallucinate**. Admin duyệt trước khi publish.
- **Sale học & tra cứu**: bản đồ quan hệ dự án (force-graph), lọc/tìm, **hành trình
  khám phá** (đào từ 1 dự án sang dự án cùng CĐT/khu/phân khúc), **learning hub**
  cho từng dự án, **phối cảnh 3D aerial** để hình dung thực địa.
- **Trợ lý bán hàng**: từ knowledge base sinh ra **điểm bán hàng, lợi thế cạnh
  tranh, talking points tư vấn, nội dung đăng bài/video** — theo template
  rule-based, có nguồn — để sale dùng ngay khi nói chuyện với khách.

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

## 4. Lộ trình giai đoạn (G0–G8)

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
| **G7** 🎯 | Sales assist (talking points + nội dung) | từ facts+tags sinh điểm bán hàng / lợi thế cạnh tranh / pitch / post-video, có nguồn | G4, G9 | CONTENT_ENGINE |
| **G8** | 3D aerial viewer | xoay/zoom model dự án, hotspots; signed URL | G1/G2 | 3D_VIEWER_SPEC |
| **G9** 🎯 | Learning hub (trang chi tiết dự án) | nơi sale học 1 dự án: facts+nguồn, tài liệu, tiện ích, pháp lý, 3D | G1/G2 (đủ ở G4) | (mới — sẽ thêm doc) |
| **G10** 🎯 | Hành trình khám phá | click node → đào sâu dự án cùng CĐT/khu/phân khúc; so sánh đối thủ | G1, G9 | (mới — sẽ thêm doc) |

⭐ = trọng tâm dữ liệu. 🎯 = trực tiếp phục vụ sale enablement. ✅ = đã hoàn thành.

---

## 5. Thứ tự thực thi đề xuất

```
S1 ✅ ─ S2 ✅ ─ G0 ─ G1 ─ G2 ─ G3 ─ G4 ⭐ ─ G9 🎯 ─ G7 🎯 ─ G10 🎯 ─ G5 ─ G6
                         │                        │
                         └── G8 (3D) ─────────────┘  (song song, nhúng vào G9)
```

- **Đường chính** (tuần tự): G0 → G4 dựng knowledge base → **G9 → G7 → G10** là
  3 mảnh trực tiếp tạo giá trị sale (học dự án → talking points/nội dung → khám
  phá & so sánh). Đây mới là "đích" của sản phẩm, không dừng ở G4.
- **G8 (3D)** độc lập sau G1/G2, chạy song song, **nhúng vào learning hub G9**.
- **G7 (sales assist)** cần facts/tags ở G4 và khung learning hub ở G9.
- G5/G6 (scale/hardening) làm khi đã có người dùng thật, không chặn giá trị cốt lõi.

---

## 6. Mô hình dữ liệu — bảng theo giai đoạn

| Bảng | Xuất hiện ở | Vai trò |
|---|---|---|
| `projects`, `relations` | G1 | dữ liệu cấu trúc + cạnh map |
| `profiles` | G2 | role admin/user |
| `documents` | G3 | file đã upload |
| `extractions`, `tags`, `project_tags` | G4 | kết quả rule-based + provenance |
| `ingestion_jobs` | G5 | hàng đợi xử lý lô |
| `content_templates`, `content_suggestions` | G7 | template talking points/pitch/post-video + đầu ra |
| `project_models`, `model_hotspots` | G8 | model 3D + điểm tương tác |
| `selling_points`, `comparisons` (dự kiến) | G9/G10 | điểm bán hàng & so sánh đối thủ (suy ra bằng rule) |

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

---

## 10. Quyết định đã chốt & còn mở
**Đã chốt:**
- **Mục tiêu sản phẩm: sale enablement** — đào tạo/hỗ trợ sale BĐS (đặc biệt người
  mới) và bán cho CĐT/sàn để rút ngắn training. Người dùng chính = **môi giới/sale**.
- G7 reframe thành **sales assist** (talking points/lợi thế cạnh tranh/pitch/nội
  dung), **thuộc lõi** — không phải tính năng phụ.
- Thêm **G9 learning hub** (trang chi tiết dự án) và **G10 hành trình khám phá +
  so sánh** vào lõi; đây mới là "đích" sản phẩm, không dừng ở knowledge base (G4).
- Không RAG/không AI API · nguồn nạp = upload file · admin nạp, sale xem · public 1
  dự án demo + auth · Python chạy **Vercel Python Functions** · 3D render client-side.

**Còn mở:** (a) OCR brochure ảnh ở G4 hay G6; (b) worker Python riêng nếu batch
nặng; (c) nguồn được phép thu thập; (d) mức "gamification/đào tạo" cho sale mới
(quiz, checklist tư vấn) — cân nhắc khi làm G9.

**Còn mở:** (a) OCR brochure ảnh ở G4 hay G6; (b) lên worker Python riêng ở G5 nếu
batch quá nặng cho Vercel Functions; (c) nguồn được phép thu thập (pháp lý).
