# Spec — 3D Aerial Interactive Viewer

Phối cảnh **3D tương tác** cho từng dự án: lăn/kéo chuột để **xoay quanh** mô hình
aerial (nhìn từ trên cao), zoom, pan; điểm nóng (hotspot) hiện thông tin block /
tiện ích. Tích hợp vào trang chi tiết dự án bên cạnh map force-graph.

---

## 1. Vercel có handle nổi không? (phân tích kiến trúc)

3D tương tác gồm **3 phần tách biệt** — chỉ 1 phần chạy trên Vercel:

```
[A] TẠO MODEL 3D            [B] LƯU & PHÂN PHỐI          [C] RENDER & TƯƠNG TÁC
   (offline, 1 lần)            (CDN/object storage)         (trình duyệt user)
   drone/ảnh → photogrammetry  .glb + .ktx2 texture         WebGL/WebGPU GPU máy khách
   hoặc model có sẵn           Supabase Storage + CDN       Three.js / React Three Fiber
   ❌ KHÔNG trên Vercel        ⚠️ KHÔNG nhồi vào bundle     ✅ Vercel chỉ gửi JS, GPU user render
```

**Vì sao Vercel ổn:**
- Render chạy bằng **GPU của người dùng** (WebGL/WebGPU). Vercel **không** tính
  toán 3D — chỉ phục vụ Next.js + file JS tĩnh qua CDN.
- Tải tương tác (xoay/zoom) = 100% client-side → Vercel không tốn compute.

**Hai điểm nghẽn THẬT (không nằm ở khả năng Vercel, mà ở dữ liệu):**
1. **Kích thước model.** File `.glb` aerial dễ 20–200MB. Phải:
   - Nén hình học **Draco** / **Meshopt**; nén texture **KTX2/Basis** (GPU đọc trực tiếp).
   - **Stream/LOD**: tải mức thấp trước, chi tiết sau; chỉ tải khi user mở tab 3D.
   - Để file ở **Supabase Storage + CDN**, **không** commit vào repo / bundle Vercel.
2. **Tạo model 3D** (photogrammetry từ ảnh drone) rất nặng GPU/RAM/giờ → làm
   **offline**, ngoài Vercel hoàn toàn.

**Giới hạn Vercel cần biết (đừng đụng phải):**
| Giới hạn Vercel | Hệ quả với 3D |
|---|---|
| Serverless/Python Function: RAM & timeout giới hạn, **không GPU** | ❌ Không render/không photogrammetry trong function. Function chỉ cấp **signed URL** tới model. |
| Kích thước deploy/bundle | ❌ Không đặt `.glb` lớn trong `public/` hay bundle. ✅ Để ở Storage/CDN. |
| Băng thông (bandwidth tính phí) | ⚠️ Model nặng × nhiều lượt xem = tốn băng thông. Nén + cache + CDN giảm mạnh. |

> **Tóm lại:** kiến trúc này Vercel handle tốt **với điều kiện** model được nén &
> phục vụ qua object storage/CDN, và bước tạo model 3D làm offline. Vercel = host
> Next.js + cấp signed URL. Không có gì "nặng" chạy trên Vercel.

---

## 2. Tech stack đề xuất

| Lớp | Lựa chọn | Ghi chú |
|---|---|---|
| Render 3D | **Three.js** qua **@react-three/fiber** + **@react-three/drei** | React-friendly, hợp Next.js |
| Điều khiển camera | `OrbitControls` (drei) | xoay quanh tâm khi kéo chuột, zoom khi lăn |
| Định dạng model | **glTF/GLB** + **Draco** + **KTX2** texture | chuẩn web, nén tốt |
| Tải/stream | `useGLTF` + `Suspense` + LOD; lazy mount khi mở tab 3D | tránh tải khi không cần |
| Lưu trữ | **Supabase Storage** (bucket `models`) + CDN | signed URL, không public bừa |
| Cấp URL | Vercel Route Handler → Supabase signed URL | server-only key |
| Fallback | ảnh phối cảnh tĩnh / `<model-viewer>` nếu thiết bị yếu | đảm bảo luôn xem được |

> WebGPU (nếu trình duyệt hỗ trợ) cho hiệu năng tốt hơn; fallback WebGL2 mặc định.

---

## 3. Mô hình dữ liệu (thêm vào Supabase)

```sql
project_models(
  id uuid pk, project_id uuid fk,
  storage_path text,            -- đường dẫn .glb trong bucket 'models'
  format text default 'glb',
  draco bool default true, ktx2 bool default true,
  lod_levels int default 1,
  poster_path text,             -- ảnh thumbnail/fallback
  size_bytes bigint, status text,    -- uploaded|optimized|ready|error
  created_at)

model_hotspots(                 -- điểm tương tác trên model
  id uuid pk, model_id uuid fk,
  label text, kind text,        -- block|amenity|view|gate
  x numeric, y numeric, z numeric,   -- toạ độ 3D
  ref_project_id uuid,          -- (optional) liên kết sang dự án khác
  payload jsonb)
```

RLS: read theo `projects.visibility` (public thấy model của dự án demo); write chỉ admin.

---

## 4. Pipeline model (offline → storage)

```
[Offline, KHÔNG trên Vercel]
  ảnh drone / model gốc
   → photogrammetry (RealityCapture/Metashape) HOẶC model thủ công (Blender)
   → tối ưu web: gltf-transform (draco + ktx2 + prune + weld)  ← script CLI 1 lần
   → .glb tối ưu
        │ admin upload
        ▼
  Supabase Storage (bucket 'models')  +  bản ghi project_models
        │ Vercel Route Handler cấp signed URL khi user mở viewer
        ▼
  Trình duyệt tải .glb (CDN) → React Three Fiber render
```

- Bước tối ưu (`gltf-transform`) chạy **máy local / CI job riêng**, không phải Vercel function.
- Idempotent: dedupe theo hash; lưu `size_bytes`, đánh dấu `optimized`.

---

## 5. Component (client-side, lazy)

```tsx
// components/viewer3d/AerialViewer.tsx  ("use client")
// - dynamic import, ssr:false (WebGL cần window)
// - chỉ mount khi user mở tab "3D" → không tải .glb sớm
<Canvas>                          // react-three-fiber
  <Suspense fallback={<Poster/>}> // hiện ảnh tĩnh trong lúc tải
    <Model url={signedUrl}/>      // useGLTF + Draco/KTX2 loader
    <Hotspots data={hotspots}/>   // Html/billboard tại toạ độ 3D
  </Suspense>
  <OrbitControls
     enablePan enableZoom enableRotate
     autoRotate={idle}            // tự xoay nhẹ khi không tương tác
     minDistance maxDistance      // chặn zoom quá gần/xa
  />
  <Environment/> <ambientLight/> <directionalLight/>
</Canvas>
```

Hành vi tương tác:
- **Kéo chuột** → xoay quanh tâm dự án (orbit).
- **Lăn chuột** → zoom in/out (có chặn min/max).
- **Chuột phải/2 ngón** → pan.
- **Idle** → tự xoay nhẹ (auto-rotate), dừng khi user chạm.
- **Click hotspot** → popover thông tin block/tiện ích (từ `model_hotspots`).

---

## 6. Hiệu năng & chi phí (checklist bắt buộc)

- [ ] Nén **Draco** (hình học) + **KTX2/Basis** (texture) — giảm 5–10× dung lượng.
- [ ] **Lazy mount**: chỉ tải `.glb` khi user mở tab 3D, không tải ở trang list.
- [ ] **LOD / poster**: hiện ảnh tĩnh ngay, model chi tiết tải nền.
- [ ] Giới hạn `maxDistance`, `dpr={[1,2]}`, cap pixel ratio để mượt trên mobile.
- [ ] **Fallback**: thiết bị yếu/không WebGL → ảnh phối cảnh tĩnh.
- [ ] File ở **Storage+CDN**, cache-control dài; **không** trong bundle Vercel.
- [ ] Theo dõi **bandwidth** Vercel/Storage (model nặng × lượt xem).
- [ ] Mục tiêu: model web tối ưu **< 15–25MB/dự án** cho trải nghiệm mượt.

---

## 7. Vị trí trong roadmap

**G8 — 3D Aerial Viewer** (độc lập, có thể làm song song sau khi có trang chi tiết
dự án):

| | Mốc | Nội dung |
|---|---|---|
| G8.0 | Spike | 1 dự án demo + 1 file `.glb` mẫu → viewer xoay/zoom chạy trên Vercel |
| G8.1 | Storage + signed URL | bucket `models`, Route Handler cấp URL, bảng `project_models` |
| G8.2 | Pipeline tối ưu | script `gltf-transform` (draco+ktx2) offline; UI admin upload model |
| G8.3 | Hotspots | `model_hotspots` + popover; liên kết hotspot ↔ dự án/tiện ích |
| G8.4 | Hardening | LOD/streaming, fallback, mobile, đo bandwidth |

Phụ thuộc: trang chi tiết dự án (G1/G2). Không phụ thuộc content engine (G7) hay
ingestion (G4) — có thể chạy song song.

---

## 8. Rủi ro & cách giảm
| Rủi ro | Giảm thiểu |
|---|---|
| Model quá nặng → tải chậm/tốn băng thông | Draco+KTX2, LOD, lazy mount, mục tiêu <25MB |
| Thiết bị yếu/không GPU | Fallback ảnh tĩnh / `<model-viewer>` |
| Tạo model 3D tốn kém | Làm offline 1 lần; ưu tiên dự án trọng điểm trước |
| Lạm dụng băng thông Storage | CDN cache, signed URL hết hạn, theo dõi usage |
| Cố render trong Vercel function | ❌ Không bao giờ — function chỉ cấp signed URL |
```
