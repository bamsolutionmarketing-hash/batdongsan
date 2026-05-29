# Sales Assist Engine (G7) — Kiến trúc

> Tổng quan toàn bộ G0–G14: xem [MASTER_ROADMAP.md](./MASTER_ROADMAP.md).

**Mục tiêu: trang bị cho sale (đặc biệt người mới) thứ cần để bán một dự án** —
sinh ra từ knowledge base đã duyệt:
- **Điểm bán hàng & lợi thế cạnh tranh** (vì sao dự án này hơn đối thủ cùng khu).
- **Talking points tư vấn** (trả lời câu hỏi thường gặp của khách, kèm số liệu có nguồn).
- **Nội dung đăng bài / kịch bản video** để sale tự marketing.

Các đầu ra này dùng chung một engine template rule-based; "post/video" chỉ là một
vài *format*, bên cạnh format "pitch" và "talking points".

> Cùng triết lý với ingestion: **rule-based / template-driven, KHÔNG gọi API AI
> sinh tự do** → mọi câu chữ đầu ra đều truy được về **dữ liệu nguồn + template
> nào** sinh ra. Không bịa → **sale tin được khi nói với khách**. Admin/sale chỉnh
> sửa trước khi dùng.

---

## 1. Engine này lấy "nguyên liệu" từ đâu

Content engine **không tự thu thập dữ liệu** — nó đọc kết quả đã duyệt:

```
documents → (rule-based ingestion) → extractions/tags → projects(structured)
                                                              │
                                                              ▼
                                          ┌───────────────────────────────┐
                                          │  CONTENT ENGINE (rule-based)   │
                                          │  facts + tags  ×  templates    │
                                          │        → content suggestions   │
                                          └───────────────────────────────┘
```

Mỗi dự án cung cấp một **Fact Sheet** chuẩn hoá (đầu vào của engine):

```ts
interface ProjectFacts {
  name: string; developer: string; district: string; city: string;
  segment: Segment; status: ProjectStatus;
  pricePerSqmM?: number; areaRange?: [number, number];
  amenities: string[];          // từ tag kind='amenity'
  categories: string[];         // từ tag kind='category'
  highlights: string[];         // câu nguồn (source span) admin đã confirm
  legal?: string; handoverDate?: string;
  // Mỗi field kèm provenance để truy nguồn:
  provenance: Record<string, { ruleId: string; sourceSpan: string }>;
}
```

Chỉ field có **provenance đã confirm** mới được đưa vào content → không hallucinate.

---

## 2. Mô hình 3 lớp

```
        ┌─────────────────────────────────────────────────────────────┐
        │ Lớp 1 — ANGLES (góc nội dung)                                 │
        │ Rule chọn góc phù hợp theo facts:                             │
        │  • giá < TB khu vực  → angle "Giá tốt khu vực"               │
        │  • segment=luxury    → angle "Đẳng cấp / vị trí"             │
        │  • status=selling    → angle "Cơ hội mở bán / ưu đãi"        │
        │  • có amenity hồ bơi/sông → angle "Tiện ích sống"           │
        │  → trả về danh sách Angle đã xếp hạng (rule-scored)          │
        └───────────────────────────┬─────────────────────────────────┘
                                     ▼
        ┌─────────────────────────────────────────────────────────────┐
        │ Lớp 2 — TEMPLATES (khuôn nội dung theo định dạng)            │
        │  Mỗi (angle × format) có 1+ template với placeholder:        │
        │   format ∈ { talking_points, pitch, faq_answer,             │  ← phục vụ tư vấn
        │              facebook_post, short_video, long_video,        │  ← phục vụ marketing
        │              reels_script, carousel, listing_caption }       │
        │  Template = chuỗi có {{slot}} + ràng buộc slot bắt buộc      │
        │  Render bằng slot-filling từ ProjectFacts (KHÔNG sinh từ).   │
        └───────────────────────────┬─────────────────────────────────┘
                                     ▼
        ┌─────────────────────────────────────────────────────────────┐
        │ Lớp 3 — ASSEMBLY (lắp ráp đầu ra)                            │
        │  • Post: hook + body + bullet tiện ích + CTA + hashtag       │
        │  • Video: outline cảnh (scene) + lời thoại + b-roll gợi ý    │
        │  • Gắn provenance cho từng slot đã điền                      │
        │  • Báo "thiếu dữ liệu" nếu slot bắt buộc trống (không bịa)   │
        └─────────────────────────────────────────────────────────────┘
```

**Quy tắc vàng:** nếu một slot bắt buộc không có fact tương ứng → engine **không
điền bừa**, mà đánh dấu `missing` và đề xuất admin bổ sung. Đầu ra luôn = dữ liệu
thật đã duyệt.

---

## 3. Mô hình dữ liệu (thêm vào Supabase)

```sql
content_templates(
  id uuid pk, angle text, format text,        -- format: facebook_post|short_video|...
  body text,                                   -- chuỗi có {{slot}}
  required_slots text[],                       -- slot bắt buộc
  locale text default 'vi', active bool, created_at)

content_suggestions(
  id uuid pk, project_id uuid fk, template_id uuid fk,
  angle text, format text,
  rendered jsonb,            -- { hook, body, bullets[], cta, hashtags[], scenes[] }
  used_facts jsonb,          -- field → {value, ruleId, sourceSpan}  (provenance)
  missing_slots text[],      -- slot bắt buộc còn thiếu
  status text,               -- suggested|edited|approved|exported
  edited_body text,          -- bản admin chỉnh tay (nếu có)
  created_at, updated_at)
```

RLS: chỉ `role='admin'` đọc/ghi. Đầu ra publish/export do admin chủ động.

---

## 4. Engine (Python, rule-based, chạy Vercel Python Functions)

```python
# Thuần & deterministic — test bằng pytest.

ANGLE_RULES: list[AngleRule]      # điều kiện trên ProjectFacts → (angle, score)
def select_angles(facts) -> list[ScoredAngle]

def pick_templates(angle, format, locale) -> list[Template]   # từ content_templates

def render(template, facts) -> Rendered:
    # slot-filling thuần: thay {{slot}} bằng fact; KHÔNG sinh chữ mới.
    # trả về rendered + used_facts(provenance) + missing_slots

def suggest(facts, formats) -> list[ContentSuggestion]
    # = select_angles × pick_templates × render, xếp hạng theo score
```

**Mở rộng dễ:**
- Thêm **angle** = thêm 1 `AngleRule` (điều kiện + điểm).
- Thêm **định dạng/nền tảng** (vd TikTok, YouTube Shorts, Zalo) = thêm template
  cho format đó — không sửa lõi.
- Thêm **template** = thêm dòng trong `content_templates` (admin tự thêm qua UI).
- Đa ngôn ngữ: cột `locale`.

---

## 5. Đầu ra mẫu (minh hoạ)

**facebook_post** (angle = "Giá tốt khu vực"):
```
🏙️ {{name}} — {{district}} chỉ từ {{price_per_sqm}} tr/m²
{{highlight_1}}
✅ {{amenity_1}}  ✅ {{amenity_2}}  ✅ {{amenity_3}}
👉 {{cta}}
#{{developer_tag}} #BĐS{{district_tag}}
```
→ render bằng facts thật; thiếu `price_per_sqm` ⇒ chuyển sang template angle khác
hoặc báo missing.

**short_video** (kịch bản cảnh):
```
Scene 1 (0-3s) Hook:  "{{name}} – {{segment_vi}} tại {{district}}"   [b-roll: ngoại cảnh]
Scene 2 (3-8s) Vị trí: "{{location_highlight}}"                       [b-roll: bản đồ]
Scene 3 (8-15s) Tiện ích: "{{amenity_1}}, {{amenity_2}}"             [b-roll: tiện ích]
Scene 4 (15-20s) CTA:  "{{cta}}"                                      [text overlay]
```

---

## 6. Vị trí trong roadmap

Đây là **G7 — Content Suggestion** (sau khi knowledge base đã có ở G4):

| | Giai đoạn | Phụ thuộc |
|---|---|---|
| G4 | Engine rule-based tag/category (knowledge base) | — |
| **G7** | **Content engine: angles + templates + assembly** | cần facts/tags từ G4 |
| G7.1 | UI admin: xem gợi ý, sửa, duyệt, **export** (copy / .txt / .srt) | |
| G7.2 | Quản lý template trong /admin (CRUD `content_templates`) | |
| G7.3 | Mở rộng format: TikTok / YouTube Shorts / Zalo / carousel | |

Vẫn chạy **Vercel Python Functions** (đã chốt), không thêm hạ tầng, không ASt,
không key AI.

---

## 7. Vì sao không hallucinate (tóm tắt)
1. Đầu vào chỉ là **facts đã admin confirm** (có provenance từ ingestion).
2. Render là **slot-filling** trên template cố định — không có mô hình sinh.
3. Slot bắt buộc thiếu fact ⇒ **báo missing**, không điền bừa.
4. Mỗi gợi ý lưu `used_facts` → truy ngược được từng câu về nguồn gốc.
5. Admin **duyệt/sửa** trước khi export.
