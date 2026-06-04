import { Card, CardTitle, CardDesc } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";

// "Hôm Nay" autopilot — placeholder until the Suggestion Engine (S5.5).
export default function DashboardPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">Hôm Nay</h1>
        <p className="text-sm text-slate-400">Gợi ý bài đăng hằng ngày sẽ xuất hiện ở đây.</p>
      </header>
      <Card>
        <CardTitle>Chưa có gợi ý</CardTitle>
        <CardDesc>
          Suggestion Engine (S5.5) sẽ đề xuất 1 bài + tối đa 3 việc mỗi sáng. Trong lúc chờ, chọn
          một dự án để xem bản đồ tri thức.
        </CardDesc>
        <ButtonLink href="/projects" className="mt-4">Xem dự án →</ButtonLink>
      </Card>
    </main>
  );
}
