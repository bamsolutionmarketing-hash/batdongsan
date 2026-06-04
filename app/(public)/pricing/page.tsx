import { ButtonLink } from "@/components/ui/button";

const TIERS = [
  { name: "Free", price: "0đ", items: ["2 dự án demo", "3 bài/ngày", "ảnh có watermark"] },
  { name: "Pro", price: "199K/tháng", items: ["Mọi dự án", "50 bài/ngày", "ảnh sạch + story"] },
  { name: "Team", price: "999K/tháng", items: ["5 thành viên", "như Pro", "(seats: Phase 2)"] },
];

export default function PricingPage() {
  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Bảng giá</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-slate-100">{t.name}</h2>
            <p className="mt-1 text-2xl font-bold text-sky-400">{t.price}</p>
            <ul className="mt-3 flex flex-col gap-1 text-sm text-slate-400">
              {t.items.map((i) => <li key={i}>• {i}</li>)}
            </ul>
            <ButtonLink href="/signup" className="mt-4 w-full">Bắt đầu</ButtonLink>
          </div>
        ))}
      </div>
    </main>
  );
}
