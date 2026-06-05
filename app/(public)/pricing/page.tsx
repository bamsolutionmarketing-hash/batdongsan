import { ButtonLink, Button } from "@/components/ui/button";
import { Notice } from "@/app/(admin)/admin/_Notice";
import { upgradeStub } from "./_actions";

const TIERS = [
  { name: "Free", tier: "free", price: "0đ", items: ["2 dự án demo", "3 bài/ngày", "ảnh có watermark"] },
  { name: "Pro", tier: "pro", price: "199K/tháng", items: ["Mọi dự án", "50 bài/ngày", "ảnh sạch + story"] },
  { name: "Team", tier: "team", price: "999K/tháng", items: ["5 thành viên", "như Pro", "(seats: Phase 2)"] },
];

export default function PricingPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Bảng giá</h1>
      <Notice error={searchParams.error} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-slate-100">{t.name}</h2>
            <p className="mt-1 text-2xl font-bold text-sky-400">{t.price}</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm text-slate-400">
              {t.items.map((i) => <li key={i}>• {i}</li>)}
            </ul>
            {t.tier === "free" ? (
              <ButtonLink href="/signup" variant="outline" className="mt-4 w-full">Bắt đầu</ButtonLink>
            ) : (
              <form action={upgradeStub} className="mt-4">
                <input type="hidden" name="tier" value={t.tier} />
                <Button type="submit" className="w-full">Nâng cấp (test)</Button>
              </form>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600">
        Thanh toán đang ở chế độ thử nghiệm (stub). Tích hợp PayOS thật khi có khóa API.
      </p>
    </main>
  );
}
