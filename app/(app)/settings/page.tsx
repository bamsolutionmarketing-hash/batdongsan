import { getSession } from "@/lib/auth";
import { getBranding } from "@/lib/repo/branding";
import { saveBranding } from "./_actions";
import { Notice } from "@/app/(admin)/admin/_Notice";
import { Button } from "@/components/ui/button";

const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";
const label = "text-[11px] uppercase tracking-wide text-muted-foreground";

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
    <main className="mx-auto flex max-w-xl flex-col gap-5 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Thương hiệu cá nhân</h1>
      <p className="text-sm text-muted-foreground">
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
          <input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="text-sm text-foreground" />
        </div>

        <hr className="border-border" />
        <p className="text-sm font-medium text-foreground">Hồ sơ cho kịch bản video</p>
        <p className="-mt-1 text-xs text-muted-foreground">Dùng để lắp hook uy tín (CTX/PROOF) và chọn giọng phù hợp.</p>
        <div className="grid grid-cols-2 gap-3">
          <div><p className={label}>Số năm kinh nghiệm</p><input name="so_nam_kn" type="number" min="0" defaultValue={b?.soNamKn ?? ""} className={input} /></div>
          <div><p className={label}>Số giao dịch</p><input name="so_giao_dich" type="number" min="0" defaultValue={b?.soGiaoDich ?? ""} className={input} /></div>
        </div>
        <div><p className={label}>Khu vực chuyên</p><input name="khu_vuc_chuyen" defaultValue={b?.khuVucChuyen ?? ""} placeholder="vd: căn hộ khu Đông" className={input} /></div>
        <div><p className={label}>Kênh đặt lịch / bio</p><input name="kenh_dat" defaultValue={b?.kenhDat ?? ""} placeholder="vd: link ở bio" className={input} /></div>
        <div>
          <p className={label}>Giọng văn (chọn ≥1)</p>
          <div className="mt-1 flex flex-wrap gap-3 text-sm text-foreground">
            {([["chuyen_gia", "Chuyên gia"], ["than_thien", "Thân thiện"], ["ke_chuyen", "Kể chuyện"]] as const).map(([v, lbl]) => (
              <label key={v} className="flex items-center gap-1.5">
                <input type="checkbox" name="tone_profile" value={v} defaultChecked={(b?.toneProfile ?? ["chuyen_gia", "than_thien"]).includes(v)} />
                {lbl}
              </label>
            ))}
          </div>
        </div>

        <Button type="submit" className="self-start">Lưu</Button>
      </form>
    </main>
  );
}
