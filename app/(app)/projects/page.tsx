import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listPublishedProjects } from "@/lib/repo/projects";
import { getAccessState, listOwnAccess } from "@/lib/repo/access";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardTitle, CardDesc } from "@/components/ui/card";
import { unlockProject, renewProject } from "./_access_actions";

const OK_MSG: Record<string, string> = {
  free: "Đã mở khoá dự án (trong gói).",
  paid: "Đã mở khoá dự án (thuê theo tháng).",
  pool: "Đã thêm dự án vào pool.",
  renew: "Đã gia hạn thêm 30 ngày.",
  lock: "Đã gỡ dự án.",
};

const daysLeft = (iso: string) => Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86400000));

export default async function ProjectsPage({ searchParams }: { searchParams: { ok?: string; error?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [res, state, own] = await Promise.all([
    listPublishedProjects(),
    getAccessState(session.userId),
    listOwnAccess(session.userId),
  ]);
  const projects = res.ok ? res.data : [];
  const isAdmin = state.role === "admin";
  const canFree = !state.managed && !isAdmin && state.includedCount < state.base;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Dự án</h1>
        {!state.all && (
          <span className="text-sm text-muted-foreground">
            {isAdmin ? `Pool: ${state.includedCount}/${state.base} dự án` : `Đã mở: ${state.accessible.size}`}
          </span>
        )}
      </div>

      {searchParams.error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{searchParams.error}</p>
      )}
      {searchParams.ok && (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">{OK_MSG[searchParams.ok] ?? "Đã cập nhật."}</p>
      )}

      {!state.all && !isAdmin && (
        <p className="text-sm text-muted-foreground">
          Gói của bạn mở {state.base} dự án{state.managed ? " (cộng pool của admin)" : ""}. Mở thêm sẽ thuê theo tháng (30 ngày, gia hạn được).
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => {
          const unlocked = state.all || state.accessible.has(p.id);
          const acc = own.get(p.id);
          return (
            <Card key={p.id} className="flex flex-col">
              <CardTitle>{p.name}</CardTitle>
              {p.locationText && <CardDesc>{p.locationText}</CardDesc>}

              {unlocked ? (
                <div className="mt-4 flex flex-col gap-2">
                  <ButtonLink href={`/projects/${p.slug}`} variant="outline" className="self-start">Mở bản đồ →</ButtonLink>
                  {acc?.paid && acc.expiresAt && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Thuê tháng · còn {daysLeft(acc.expiresAt)} ngày</span>
                      <form action={renewProject}>
                        <input type="hidden" name="project_id" value={p.id} />
                        <button className="text-sky-400 hover:underline">Gia hạn</button>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                <form action={unlockProject} className="mt-4">
                  <input type="hidden" name="project_id" value={p.id} />
                  {isAdmin ? (
                    <button disabled={state.includedCount >= state.base} className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                      {state.includedCount >= state.base ? "Hết hạn mức pool" : "+ Thêm vào pool"}
                    </button>
                  ) : canFree ? (
                    <button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">🔓 Mở khoá (trong gói)</button>
                  ) : (
                    <button className="rounded-md border border-amber-600/60 bg-amber-950/20 px-3 py-2 text-sm font-medium text-amber-200 hover:border-amber-500">💳 Thuê theo tháng</button>
                  )}
                </form>
              )}
            </Card>
          );
        })}
      </div>
    </main>
  );
}
