import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { CalculatorPanel } from "@/components/finance/CalculatorPanel";

// Máy tính tài chính — bộ công cụ cho sale dùng ngay khi chat khách: trả góp,
// khả năng vay, lịch thanh toán theo tiến độ, dòng tiền cho thuê. Tính ngay trên
// máy (engine thuần ở lib/finance), xuất text/ảnh có thương hiệu để gửi khách.
export default async function CalculatorPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-bold">🧮 Máy tính tài chính</h1>
        <p className="text-sm text-muted-foreground">
          Tính nhanh để tư vấn khách — kết quả kèm giải thích dễ hiểu, copy hoặc xuất ảnh có thương hiệu.
        </p>
      </header>
      <CalculatorPanel />
    </main>
  );
}
