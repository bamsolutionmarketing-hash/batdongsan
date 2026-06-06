import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getBranding } from "@/lib/repo/branding";
import { listPublishedProjects } from "@/lib/repo/projects";
import { getAccessState } from "@/lib/repo/access";
import { saveBranding } from "@/app/(app)/settings/_actions";
import { onboardingPickProject } from "./_actions";

const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";
const label = "text-[11px] uppercase tracking-wide text-muted-foreground";

function StepDots({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {[1, 2, 3].map((s) => (
        <span key={s} className={`flex h-6 w-6 items-center justify-center rounded-full border ${s === step ? "border-sky-500 bg-sky-600 text-white" : s < step ? "border-emerald-600 bg-emerald-600/20 text-emerald-400" : "border-border"}`}>
          {s < step ? "✓" : s}
        </span>
      ))}
    </div>
  );
}

export default async function OnboardingPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const [bRes, access] = await Promise.all([getBranding(session.userId), getAccessState(session.userId)]);
  const b = bRes.ok ? bRes.data : null;
  const brandingReady = !!b && !!b.displayName?.trim() && !!b.phone?.trim();
  const hasProject = access.all || access.accessible.size > 0;
  const step: 1 | 2 | 3 = !brandingReady ? 1 : !hasProject ? 2 : 3;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bắt đầu trong 3 bước</h1>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Để sau →</Link>
      </div>
      <StepDots step={step} />
      {searchParams.error && (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{searchParams.error}</p>
      )}

      {step === 1 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Bước 1 — Thương hiệu cá nhân</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Tên + SĐT tự điền vào bài ([TEN_SALE]/[SDT]) và đóng lên ảnh.</p>
          <form action={saveBranding} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="next" value="/onboarding" />
            <input type="hidden" name="position" value="bottom_right" />
            <div><p className={label}>Tên hiển thị *</p><input name="display_name" defaultValue={b?.displayName ?? ""} required className={input} /></div>
            <div><p className={label}>SĐT *</p><input name="phone" defaultValue={b?.phone ?? ""} required className={input} /></div>
            <div><p className={label}>Zalo (tuỳ chọn)</p><input name="zalo" defaultValue={b?.zalo ?? ""} className={input} /></div>
            <button className="self-start rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Lưu & tiếp tục →</button>
          </form>
        </section>
      )}

      {step === 2 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Bước 2 — Chọn dự án đầu tiên (miễn phí)</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Gói free mở 1 dự án. Chọn 1 dự án để mở khoá và tạo bài.</p>
          <ProjectPicker />
        </section>
      )}

      {step === 3 && (
        <section className="rounded-lg border border-border bg-card p-4 text-center">
          <h2 className="text-lg font-semibold text-foreground">🎉 Sẵn sàng!</h2>
          <p className="mt-1 text-sm text-muted-foreground">Bạn đã thiết lập thương hiệu và mở dự án. Tạo bài đăng đầu tiên ngay.</p>
          <div className="mt-4 flex justify-center gap-2">
            <Link href="/projects" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Tạo bài đầu tiên →</Link>
            <Link href="/dashboard" className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-accent">Về trang chủ</Link>
          </div>
        </section>
      )}
    </main>
  );
}

async function ProjectPicker() {
  const res = await listPublishedProjects();
  const projects = res.ok ? res.data : [];
  if (projects.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">Chưa có dự án nào.</p>;
  }
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {projects.map((p) => (
        <form key={p.id} action={onboardingPickProject}>
          <input type="hidden" name="project_id" value={p.id} />
          <button className="w-full rounded-md border border-border bg-background px-3 py-3 text-left transition hover:border-sky-600">
            <span className="block text-sm font-medium text-foreground">{p.name}</span>
            {p.locationText && <span className="block text-xs text-muted-foreground">{p.locationText}</span>}
            <span className="mt-1 inline-block text-xs text-sky-400">🔓 Mở miễn phí & tạo bài →</span>
          </button>
        </form>
      ))}
    </div>
  );
}
