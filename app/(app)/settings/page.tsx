import { Card, CardTitle, CardDesc } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Thương hiệu cá nhân</h1>
      <Card>
        <CardTitle>Sắp có</CardTitle>
        <CardDesc>Logo, tên, SĐT, Zalo để đóng vào ảnh — thêm ở Branding pipeline (S5).</CardDesc>
      </Card>
    </main>
  );
}
