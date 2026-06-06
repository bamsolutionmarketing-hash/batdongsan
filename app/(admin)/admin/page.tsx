import Link from "next/link";
import { getSession, isSuperAdmin } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Notice } from "./_Notice";
import { promoteAdminAction, setAgentActiveAction } from "./_manage_actions";

const input = "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";
const label = "text-[11px] uppercase tracking-wide text-muted-foreground";

async function count(table: string): Promise<number | null> {
  if (!isSupabaseConfigured()) return null;
  const { count, error } = await createClient().from(table).select("id", { count: "exact", head: true });
  return error ? null : count ?? 0;
}

export default async function AdminHome({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const session = await getSession();
  const supabase = createClient();
  const sup = isSuperAdmin(session);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Bảng điều khiển Admin</h1>
      <Notice error={searchParams.error} ok={searchParams.ok} />

      {sup ? <SuperPanel supabase={supabase} /> : <AdminPanel supabase={supabase} userId={session!.userId} />}
    </main>
  );
}

// ── Super admin: app-wide content + manage admins ──────────────────────────
async function SuperPanel({ supabase }: { supabase: ReturnType<typeof createClient> }) {
  const [projects, users, hooks, { data: admins }] = await Promise.all([
    count("projects"), count("profiles"), count("hook_templates"), supabase.rpc("list_admins"),
  ]);
  const stat = (l: string, v: number | null) => (
    <div className="rounded-md border border-border bg-card px-3 py-2"><p className="text-lg font-semibold text-foreground">{v ?? "—"}</p><p className="text-xs text-muted-foreground">{l}</p></div>
  );
  type Row = { email: string; full_name: string | null; agent_quota: number | null; daily_quota: number | null; active_count: number };
  const rows = (admins ?? []) as Row[];

  return (
    <>
      <section className="grid grid-cols-3 gap-2">{stat("Dự án", projects)}{stat("Người dùng", users)}{stat("Hook kịch bản", hooks)}</section>

      <Link href="/admin/projects"><Card className="transition hover:border-foreground/30"><CardTitle>Dự án & nội dung</CardTitle><CardDesc>Tạo/sửa dự án, node tri thức, khối nội dung, ảnh (chỉ super admin).</CardDesc></Card></Link>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Cấp quyền Admin (theo email)</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">User phải đã đăng ký. agent_quota = số agent active tối đa; daily_quota = lượt/ngày cho agent của admin đó (trống = không giới hạn).</p>
        <form action={promoteAdminAction} className="mt-3 grid gap-2 sm:grid-cols-4">
          <input name="email" type="email" required placeholder="email user" className={`${input} sm:col-span-2`} />
          <input name="agent_quota" type="number" min="0" placeholder="agent_quota" className={input} />
          <input name="daily_quota" type="number" min="0" placeholder="daily_quota" className={input} />
          <Button type="submit" className="sm:col-span-4 self-start">Cấp quyền Admin</Button>
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground"><tr><th className="py-1">Admin</th><th>Active/Quota</th><th>Lượt/ngày</th></tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={3} className="py-2 text-muted-foreground">Chưa có admin nào.</td></tr> :
                rows.map((r) => (
                  <tr key={r.email} className="border-t border-border">
                    <td className="py-1 text-foreground">{r.email}</td>
                    <td>{r.active_count}/{r.agent_quota ?? "∞"}</td>
                    <td>{r.daily_quota ?? "∞"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

// ── Admin: activate/deactivate their pool of agents ────────────────────────
async function AdminPanel({ supabase, userId }: { supabase: ReturnType<typeof createClient>; userId: string }) {
  const [{ data: agents }, { data: me }] = await Promise.all([
    supabase.rpc("list_my_agents"),
    supabase.from("profiles").select("agent_quota, daily_quota").eq("id", userId).maybeSingle(),
  ]);
  type Row = { email: string; full_name: string | null; is_active: boolean };
  const rows = (agents ?? []) as Row[];
  const quota = (me as { agent_quota: number | null } | null)?.agent_quota ?? null;
  const dailyQuota = (me as { daily_quota: number | null } | null)?.daily_quota ?? null;
  const activeCount = rows.filter((r) => r.is_active).length;

  return (
    <>
      <section className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-border bg-card px-3 py-2"><p className="text-lg font-semibold text-foreground">{activeCount}/{quota ?? "∞"}</p><p className="text-xs text-muted-foreground">Agent đang active</p></div>
        <div className="rounded-md border border-border bg-card px-3 py-2"><p className="text-lg font-semibold text-foreground">{dailyQuota ?? "∞"}</p><p className="text-xs text-muted-foreground">Lượt/ngày mỗi agent</p></div>
      </section>

      <section className="rounded-lg border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Kích hoạt agent (theo email)</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">Agent phải đã tự đăng ký. Kích hoạt để nâng cấp; tắt để giải phóng slot (agent về mức free 3 lượt/ngày).</p>
        <form action={setAgentActiveAction} className="mt-3 flex flex-wrap gap-2">
          <input name="email" type="email" required placeholder="email agent" className={`${input} flex-1`} />
          <input type="hidden" name="active" value="true" />
          <Button type="submit">Kích hoạt</Button>
        </form>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground"><tr><th className="py-1">Agent</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan={3} className="py-2 text-muted-foreground">Chưa quản lý agent nào.</td></tr> :
                rows.map((r) => (
                  <tr key={r.email} className="border-t border-border">
                    <td className="py-1 text-foreground">{r.email}</td>
                    <td>{r.is_active ? <span className="text-emerald-400">● active</span> : <span className="text-muted-foreground">○ tắt</span>}</td>
                    <td className="text-right">
                      <form action={setAgentActiveAction}>
                        <input type="hidden" name="email" value={r.email} />
                        <input type="hidden" name="active" value={r.is_active ? "false" : "true"} />
                        <button className="text-sky-400 hover:underline">{r.is_active ? "Tắt" : "Bật"}</button>
                      </form>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
