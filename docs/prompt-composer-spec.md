# Prompt Composer — Spec v0 (DRAFT, chờ duyệt)

> Source of truth cho `lib/engine/promptComposer.ts` + `lib/engine/promptTemplates.ts`.
> **Pure function, server-only, KHÔNG gọi AI.** Chỉ ghép caption đã assemble + facts
> verified thành một "mega-prompt" để sale tự dán vào ChatGPT/Gemini.
> `PROMPT_VERSION = "v0"` — log vào `generated_posts.prompt_version`.
>
> ⚠️ Bản nháp do trợ lý soạn để không chặn S4. **Cần bạn review câu chữ marketing**
> trước khi chốt. Đổi nội dung template KHÔNG đụng code engine.

## 1. Chữ ký hàm

```ts
type ComposeMode = 'fb_post' | 'fb_analysis' | 'short_caption' | 'zalo_message';
type ComposeTone = 'chuyen_gia' | 'than_thien' | 'ke_chuyen';

composePrompt(input: {
  mode: ComposeMode;
  tone: ComposeTone;
  caption: string;              // bài gốc đã assemble (đã substitute [VAR])
  project: { name; location_text; view360_url };
  nodes: { label; facts: {key;value;confidence}[] }[];
  branding: { display_name; phone; zalo? };
}): string                       // trả về 1 prompt hoàn chỉnh
```

## 2. Cấu trúc mega-prompt — 6 khối (theo thứ tự)

```
① DỮ LIỆU ĐÃ XÁC THỰC      → chỉ facts confidence='verified' (key: value).
                              Facts khác KHÔNG được đưa vào (compliance theo
                              kiến trúc — model không thấy nên không thể bịa).
② BÀI GỐC                  → {caption} nguyên văn.
③ CÔNG THỨC VIẾT           → khung bài theo {mode} (mục 3).
④ GIỌNG VĂN                → chỉ dẫn theo {tone} (mục 4).
⑤ QUY TẮC TUYỆT ĐỐI + TỰ KIỂM → mục 5 (hard rules) + lệnh model tự rà trước khi xuất.
⑥ ĐỊNH DẠNG ĐẦU RA         → số đoạn, emoji, hashtag, vị trí thông tin liên hệ theo {mode}.
```

Khối ① và ⑤ là **bất biến giữa mọi mode/tone**. Khối ③④⑥ thay theo mode/tone.

## 3. MODE (4) — khối ③ + ⑥

| mode | Công thức (③) | Định dạng (⑥) |
|---|---|---|
| `fb_post` | Hook → 2–3 ý chính → chứng cứ → CTA | 4–6 đoạn ngắn, 3–6 emoji, 3–5 hashtag, SĐT cuối bài |
| `fb_analysis` | Luận điểm → phân tích số liệu → so sánh → kết luận | Dài hơn, giọng phân tích, tối đa 2 emoji, có bullet số liệu |
| `short_caption` | 1 hook + 1 chốt | ≤ 60 từ, 1–2 emoji, 1 dòng liên hệ |
| `zalo_message` | Chào → 1 lý do liên hệ ngay → mời xem | Tin nhắn 1:1, xưng "em", kèm SĐT/Zalo, không hashtag |

## 4. TONE (3) — khối ④

| tone | Chỉ dẫn giọng |
|---|---|
| `chuyen_gia` | Điềm tĩnh, dùng số liệu, khẳng định; không hô hào; "anh/chị". |
| `than_thien` | Gần gũi, ấm, vài emoji; như nhắn cho người quen. |
| `ke_chuyen` | Mở bằng một quan sát/khung cảnh ngắn rồi dẫn vào dự án. |

→ **12 tổ hợp** mode×tone đều phải compose ra prompt hợp lệ (done-condition S4).

## 5. Quy tắc tuyệt đối (khối ⑤ — bất biến)

```
- Giữ NGUYÊN 100% con số, mốc thời gian, tên riêng trong khối ① và bài gốc.
- KHÔNG thêm bất kỳ số liệu/cam kết nào không có trong khối ①.
- KHÔNG hứa lợi nhuận, KHÔNG cam kết tăng giá, KHÔNG "chắc chắn sinh lời".
- KHÔNG bịa tiện ích/pháp lý/tiến độ không có trong dữ liệu.
- Giữ nguyên thông tin liên hệ ({display_name} — {phone}) ở cuối.
- Trước khi xuất: tự rà lại, nếu có câu nào chứa số/cam kết không nằm trong
  khối ① thì XÓA câu đó.
```

## 6. PROMPT_VERSION & nghiệm thu (S4)

- `PROMPT_VERSION = "v0"`; tăng khi đổi template (đo chất lượng theo version).
- **Done S4 (phần composer):** với 1 caption mẫu + 2–3 node verified, sinh đủ
  **12 prompt** (4 mode × 3 tone); mỗi prompt có đủ 6 khối; khối ① chỉ chứa
  facts `verified`; khối ⑤ xuất hiện nguyên văn ở cả 12.
- Snapshot test: `composePrompt` là pure ⇒ test so khớp chuỗi cho từng tổ hợp.

## 7. Để mở (cần bạn chốt)
- Câu chữ chính xác cho ③④ (marketing voice của bạn).
- Có chèn `view360_url` vào ⑥ của `fb_post`/`zalo_message` không?
- Hashtag mặc định theo dự án hay theo node?
