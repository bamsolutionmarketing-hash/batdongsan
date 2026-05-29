# Slice S1 — Core: Map + Guidance Engine (render-ready)

## Mục tiêu slice
Một vertical slice chạy được ngay: mở Next.js dev server → thấy **force-graph map** các dự án BĐS + **guidance engine** chạy trên seed data thật (Masteri, Gladia). Đây là nền tảng để các slice UI/data sau xây tiếp lên, không vứt đi.

## Stack đã chốt
- **Next.js 14** (App Router, TypeScript) — đúng stack plan, tái dùng cho slice sau.
- **Tailwind CSS** + shadcn/ui (chỉ cài nền, dùng dần).
- **react-force-graph-2d** (force-directed graph, render canvas, SSR-safe qua dynamic import).
- **Vitest** cho unit test engine + data transform.

## Cấu trúc thư mục
```
/app
  layout.tsx
  page.tsx                # demo page: render map + guidance panel với seed
/components
  /map
    ForceGraph.tsx        # client component bọc react-force-graph-2d (dynamic, no SSR)
    GuidancePanel.tsx     # hiển thị output của guidance engine
/lib
  /engine
    guidance.ts           # engine lõi: nhận state → trả guidance/recommendation
    guidance.test.ts
  /map
    transform.ts          # project data → { nodes, links } cho force graph
    transform.test.ts
  /data
    seed.ts               # seed: Masteri, Gladia (+ vài node liên quan)
    types.ts              # Project, GraphNode, GraphLink, GuidanceResult
```

## Phạm vi (in-scope)
1. **Scaffold Next.js 14** tối thiểu: TS, Tailwind, app router, 1 page.
2. **types.ts** — định nghĩa `Project`, `GraphNode`, `GraphLink`, `GuidanceResult`.
3. **seed.ts** — dữ liệu Masteri + Gladia + quan hệ (vd: cùng khu vực / chủ đầu tư / phân khúc).
4. **transform.ts** — chuyển danh sách Project → `{ nodes, links }`; có test.
5. **guidance.ts** — engine thuần (pure function) sinh gợi ý từ project/graph state; có test.
6. **ForceGraph.tsx** — client component render map từ transform output (dynamic import, no SSR).
7. **GuidancePanel.tsx** — render `GuidanceResult`.
8. **page.tsx** — ghép map + panel với seed, chạy được `npm run dev`.

## Ngoài phạm vi (slice sau)
- Nguồn dữ liệu thật/scraping, DB, API.
- Auth, layout sản phẩm hoàn chỉnh, filter/search UI nâng cao.
- Styling chi tiết / responsive polish.

## Kiểm chứng (Definition of Done)
- `npm run dev` → trang hiển thị graph có node Masteri + Gladia + cạnh liên kết, panel guidance có nội dung.
- `npm test` (vitest) xanh cho `transform.test.ts` và `guidance.test.ts`.
- `npm run build` không lỗi type.
- Commit + push lên `claude/exciting-edison-gjBZe`.

## Trình tự thực hiện
1. Scaffold Next.js + Tailwind + Vitest, commit nền.
2. `types.ts` + `seed.ts`.
3. TDD `transform.ts` (test trước) → impl.
4. TDD `guidance.ts` (test trước) → impl.
5. `ForceGraph.tsx` + `GuidancePanel.tsx` + `page.tsx`.
6. Chạy dev/build/test, verify, commit + push.
