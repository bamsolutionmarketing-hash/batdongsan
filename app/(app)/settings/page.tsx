import { getSession } from "@/lib/auth";
import { getBranding } from "@/lib/repo/branding";
import { saveBranding } from "./_actions";
import { Notice } from "@/app/(admin)/admin/_Notice";
import { Button } from "@/components/ui/button";

const input = "w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100";
const label = "text-[11px] uppercase tracking-wide text-slate-500";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string; next?: string };
}) {
  const session = await getSession();
  const res = session ? await getBranding(session.userId) : null;
  const b = res && res.ok ? res.data : null;
  const next = searchParams.next?.startsWith("/") ? searchParams.next : "";

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 p-6">
      <h1 className="text-2xl font-bold">Thương hiệu cá nhân</h1>
      <p className="text-sm text-slate-400">
        Tên + SĐT này tự điền vào bài ([TEN_SALE]/[SDT]) và đóng lên ảnh khi tạo bài.
      </p>
      {next && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Hoàn tất Tên + SĐT rồi bấm Lưu để quay lại tạo bài.
        </p>
      )}
      <Notice error={searchParams.error} ok={searchParams.ok} />
      <form action={saveBranding} className="flex flex-col gap-3">
        {next && <input type="hidden" name="next" value={next} />}
        <div><p className={label}>Tên hiển thị *</p><input name="display_name" defaultValue={b?.displayName ?? ""} required className={input} /></div>
        <div><p className={label}>SĐT *</p><input name="phone" defaultValue={b?.phone ?? ""} required className={input} /></div>
        <div><p className={label}>Zalo</p><input name="zalo" defaultValue={b?.zalo ?? ""} className={input} /></div>
        <div>
          <p className={label}>Vị trí đóng logo</p>
          <select name="position" defaultValue={b?.position ?? "bottom_right"} className={input}>
            <option value="bottom_right">Dưới phải</option>
            <option value="bottom_left">Dưới trái</option>
            <option value="top_right">Trên phải</option>
            <option value="top_left">Trên trái</option>
          </select>
        </div>
        <div>
          <p className={label}>Logo (PNG/JPEG/WebP/SVG ≤2MB){b?.logoPath ? " — đã có" : ""}</p>
          <input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="text-sm text-slate-300" />
        </div>
        <Button type="submit" className="self-start">Lưu</Button>
      </form>
    </main>
  );
}
