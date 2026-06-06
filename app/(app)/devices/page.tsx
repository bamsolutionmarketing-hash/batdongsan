import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { revokeDeviceAction } from "./_actions";

const DEVICE_COOKIE = "bds_device";

// Friendly label from a User-Agent string.
function deviceLabel(ua: string | null): string {
  if (!ua) return "Thiết bị không rõ";
  const os = /Windows/i.test(ua) ? "Windows" : /Macintosh|Mac OS/i.test(ua) ? "macOS"
    : /Android/i.test(ua) ? "Android" : /iPhone|iPad|iOS/i.test(ua) ? "iOS"
    : /Linux/i.test(ua) ? "Linux" : "Hệ điều hành khác";
  const br = /Edg\//i.test(ua) ? "Edge" : /Chrome\//i.test(ua) ? "Chrome"
    : /Firefox\//i.test(ua) ? "Firefox" : /Safari\//i.test(ua) ? "Safari" : "Trình duyệt";
  return `${br} trên ${os}`;
}

function timeAgo(iso: string): string {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.round(h / 24)} ngày trước`;
}

interface DeviceRow {
  device_id: string;
  user_agent: string | null;
  ip: string | null;
  last_seen_at: string;
}

export default async function DevicesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const current = cookies().get(DEVICE_COOKIE)?.value ?? "";

  const cutoff = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data } = await createClient()
    .from("user_devices")
    .select("device_id, user_agent, ip, last_seen_at")
    .eq("user_id", session.userId)
    .is("revoked_at", null)
    .gt("last_seen_at", cutoff)
    .order("last_seen_at", { ascending: false });

  const devices = (data ?? []) as DeviceRow[];
  const currentIsActive = devices.some((d) => d.device_id === current);
  const overLimit = !currentIsActive && devices.length >= 2;

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Thiết bị đăng nhập</h1>
      {overLimit ? (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Tài khoản đã đăng nhập trên 2 thiết bị (giới hạn). Chọn 1 thiết bị bên dưới để đăng xuất thì máy này mới vào được.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Mỗi tài khoản tối đa 2 thiết bị. Đăng xuất thiết bị không dùng để giải phóng chỗ. Slot tự hết hạn sau 30 ngày không hoạt động.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {devices.map((d) => {
          const isCurrent = d.device_id === current;
          return (
            <li key={d.device_id} className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {deviceLabel(d.user_agent)} {isCurrent && <span className="text-xs text-emerald-400">(máy này)</span>}
                </p>
                <p className="truncate text-xs text-muted-foreground">{d.ip || "?"} · hoạt động {timeAgo(d.last_seen_at)}</p>
              </div>
              <form action={revokeDeviceAction} className="ml-auto">
                <input type="hidden" name="device_id" value={d.device_id} />
                <Button type="submit" variant="outline" className="px-2.5 py-1 text-xs">
                  {isCurrent ? "Đăng xuất máy này" : "Đăng xuất"}
                </Button>
              </form>
            </li>
          );
        })}
        {devices.length === 0 && <li className="text-sm text-muted-foreground">Chưa có thiết bị nào.</li>}
      </ul>
    </main>
  );
}
