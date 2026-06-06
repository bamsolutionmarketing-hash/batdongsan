import Link from "next/link";
import { requireSuper } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const iso = (ms: number) => new Date(Date.now() - ms).toISOString();
const DAY = 86_400_000;

type Sb = ReturnType<typeof createAdminClient>;
const cnt = async (sb: Sb, table: string, build?: (q: any) => any): Promise<number> => {
  let q = sb.from(table).select("id", { count: "exact", head: true });
  if (build) q = build(q);
  const { count } = await q;
  return count ?? 0;
};

export default async function AnalyticsPage() {
  await requireSuper();

  let sb: Sb;
  try {
    sb = createAdminClient();
  } catch {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Thiếu service-role key — không tải được phân tích.
        </p>
      </main>
    );
  }

  const startToday = new Date().toISOString().slice(0, 10) + "T00:00:00Z";
  const nowIso = new Date().toISOString();

  // Users
  const [profRows, devActive] = await Promise.all([
    sb.from("profiles").select("role, is_active"),
    cnt(sb, "user_devices", (q) => q.is("revoked_at", null).gt("last_seen_at", iso(30 * DAY))),
  ]);
  const profiles = (profRows.data as { role: string; is_active: boolean }[] | null) ?? [];
  const agents = profiles.filter((p) => p.role === "agent");
  const agentsActive = agents.filter((p) => p.is_active).length;
  const admins = profiles.filter((p) => p.role === "admin").length;
  const supers = profiles.filter((p) => p.role === "super_admin").length;

  // Creation activity (posts + scripts)
  const [pT, p7, p30, pAll, sT, s7, s30, sAll] = await Promise.all([
    cnt(sb, "generated_posts", (q) => q.gte("created_at", startToday)),
    cnt(sb, "generated_posts", (q) => q.gte("created_at", iso(7 * DAY))),
    cnt(sb, "generated_posts", (q) => q.gte("created_at", iso(30 * DAY))),
    cnt(sb, "generated_posts"),
    cnt(sb, "generated_scripts", (q) => q.gte("created_at", startToday)),
    cnt(sb, "generated_scripts", (q) => q.gte("created_at", iso(7 * DAY))),
    cnt(sb, "generated_scripts", (q) => q.gte("created_at", iso(30 * DAY))),
    cnt(sb, "generated_scripts"),
  ]);

  // Project access (rentals)
  const [accRes, projRes] = await Promise.all([
    sb.from("project_access").select("user_id, project_id, paid, expires_at"),
    sb.from("projects").select("id, name"),
  ]);
  const acc = (accRes.data as { user_id: string; project_id: string; paid: boolean; expires_at: string | null }[] | null) ?? [];
  const projName = new Map(((projRes.data as { id: string; name: string }[] | null) ?? []).map((p) => [p.id, p.name]));
  const isLive = (r: { expires_at: string | null }) => !r.expires_at || r.expires_at > nowIso;
  const included = acc.filter((r) => !r.paid).length;
  const paidActive = acc.filter((r) => r.paid && isLive(r)).length;
  const renters = new Set(acc.filter(isLive).map((r) => r.user_id)).size;
  const byProject = new Map<string, number>();
  for (const r of acc) if (isLive(r)) byProject.set(r.project_id, (byProject.get(r.project_id) ?? 0) + 1);
  const topProjects = [...byProject.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const Stat = ({ label, value, sub }: { label: string; value: number | string; sub?: string }) => (
    <div className="rounded-md border border-border bg-card px-3 py-2">
      <p className="text-xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/80">{sub}</p>}
    </div>
  );
  const Row = ({ label, post, script }: { label: string; post: number; script: number }) => (
    <tr className="border-t border-border">
      <td className="py-1 text-foreground">{label}</td>
      <td className="text-right">{post}</td>
      <td className="text-right">{script}</td>
      <td className="text-right font-medium text-foreground">{post + script}</td>
    </tr>
  );

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📊 Phân tích hệ thống</h1>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Admin</Link>
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Người dùng</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="Agent" value={agents.length} sub={`${agentsActive} đang active`} />
          <Stat label="Admin" value={admins} />
          <Stat label="Super admin" value={supers} />
          <Stat label="Thiết bị hoạt động" value={devActive} sub="30 ngày gần đây" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Hoạt động tạo nội dung</h2>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr><th className="p-2">Khoảng</th><th className="p-2 text-right">Bài đăng</th><th className="p-2 text-right">Kịch bản</th><th className="p-2 text-right">Tổng</th></tr>
            </thead>
            <tbody>
              <Row label="Hôm nay" post={pT} script={sT} />
              <Row label="7 ngày" post={p7} script={s7} />
              <Row label="30 ngày" post={p30} script={s30} />
              <Row label="Tổng cộng" post={pAll} script={sAll} />
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dự án đang dùng</h2>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Slot trong gói" value={included} sub="free/pro · không tính tiền" />
          <Stat label="Slot thuê tháng" value={paidActive} sub="đang còn hạn" />
          <Stat label="Người đang mở dự án" value={renters} />
        </div>
        <div className="mt-3 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted text-xs text-muted-foreground">
              <tr><th className="p-2">Dự án</th><th className="p-2 text-right">Lượt mở (đang hiệu lực)</th></tr>
            </thead>
            <tbody>
              {topProjects.length === 0 ? (
                <tr><td colSpan={2} className="p-2 text-muted-foreground">Chưa có dữ liệu.</td></tr>
              ) : (
                topProjects.map(([id, n]) => (
                  <tr key={id} className="border-t border-border">
                    <td className="py-1 text-foreground">{projName.get(id) ?? id.slice(0, 8)}</td>
                    <td className="text-right">{n}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Doanh thu cần cấu hình giá thuê/tháng và cổng PayOS (hiện đang STUB) — khi nối xong sẽ quy đổi “slot thuê tháng” × giá.
        </p>
      </section>
    </main>
  );
}
