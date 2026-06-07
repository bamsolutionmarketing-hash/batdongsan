import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getBranding } from "@/lib/repo/branding";
import { createAdminClient } from "@/lib/supabase/admin";
import { CalculatorPanel, type BrandInfo } from "@/components/finance/CalculatorPanel";

// Máy tính tài chính — bộ công cụ cho sale dùng ngay khi chat khách: trả góp,
// khả năng vay, lịch thanh toán theo tiến độ, dòng tiền cho thuê. Tính ngay trên
// máy (engine thuần ở lib/finance), kết quả có biểu đồ + xuất ảnh/PDF client-side
// (vẽ trong trình duyệt → tiếng Việt chuẩn, không phụ thuộc font server).
export default async function CalculatorPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  // Resolve branding (name/phone) + logo as a data URL so the client card can
  // stamp it without a cross-origin image fetch.
  let brand: BrandInfo | null = null;
  const res = await getBranding(session.userId);
  const b = res.ok ? res.data : null;
  if (b) {
    let logoDataUrl: string | null = null;
    if (b.logoPath) {
      try {
        const admin = createAdminClient();
        const dl = await admin.storage.from("logos").download(b.logoPath);
        if (dl.data) {
          const buf = Buffer.from(await dl.data.arrayBuffer());
          const ext = b.logoPath.split(".").pop()?.toLowerCase();
          const mime = ext === "svg" ? "image/svg+xml" : ext === "webp" ? "image/webp" : ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
          logoDataUrl = `data:${mime};base64,${buf.toString("base64")}`;
        }
      } catch {
        /* logo is best-effort */
      }
    }
    brand = { displayName: b.displayName, phone: b.phone, zalo: b.zalo, logoDataUrl };
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold">🧮 Máy tính tài chính</h1>
        <p className="text-sm text-muted-foreground">
          Tính nhanh để tư vấn khách — kết quả có biểu đồ trực quan, copy hoặc xuất ảnh/PDF có thương hiệu.
        </p>
      </header>
      <CalculatorPanel brand={brand} />
    </main>
  );
}
