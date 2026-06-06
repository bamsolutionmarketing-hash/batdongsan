import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";

// Count helper (head-only). Returns null when unavailable / RLS-blocked.
async function count(table: string): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;
  const { count, error } = await createClient().from(table).select("id", { count: "exact", head: true });
  return error ? null : count ?? 0;
}

export default async function AdminHome() {
  const [hooks, nodes, recipes, projects, users] = await Promise.all([
    count("hook_templates"),
    count("node_templates"),
    count("recipes"),
    count("projects"),
    count("profiles"),
  ]);

  const stat = (label: string, value: number | null) => (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <p className="text-lg font-semibold text-foreground">{value ?? "—"}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Bảng điều khiển Admin</h1>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stat("Dự án", projects)}
        {stat("Người dùng", users)}
        {stat("Hook", hooks)}
        {stat("Node kịch bản", nodes)}
        {stat("Recipe", recipes)}
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/admin/projects">
          <Card className="h-full transition hover:border-foreground/30">
            <CardTitle>Dự án & nội dung</CardTitle>
            <CardDesc>Tạo/sửa dự án, node tri thức, khối nội dung, tài sản ảnh.</CardDesc>
          </Card>
        </Link>
        <Card className="h-full">
          <CardTitle>Thư viện kịch bản video</CardTitle>
          <CardDesc>
            {hooks ?? "—"} hook · {nodes ?? "—"} node · {recipes ?? "—"} recipe (đồng bộ từ engine in-repo).
            Quản trị chi tiết sẽ bổ sung sau; hiện sửa trong mã nguồn rồi seed lại.
          </CardDesc>
        </Card>
      </section>
    </main>
  );
}
