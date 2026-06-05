"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/auth";
import { getBranding } from "@/lib/repo/branding";

const schema = z.object({
  display_name: z.string().min(1, "Tên không được trống"),
  phone: z.string().min(6, "SĐT không hợp lệ"),
  zalo: z.string().nullable(),
  position: z.enum(["bottom_right", "bottom_left", "top_right", "top_left"]),
});

const LOGO_EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg",
};
const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
function fail(m: string): never {
  redirect(`/settings?error=${encodeURIComponent(m)}`);
}

export async function saveBranding(fd: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");

  const parsed = schema.safeParse({
    display_name: str(fd, "display_name"),
    phone: str(fd, "phone"),
    zalo: str(fd, "zalo") || null,
    position: str(fd, "position") || "bottom_right",
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);

  // Preserve existing logo unless a new one is uploaded.
  const cur = await getBranding(session.userId);
  let logoPath = cur.ok && cur.data ? cur.data.logoPath : null;

  const file = fd.get("logo");
  if (file instanceof File && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) fail("Logo quá lớn (>2MB)");
    const ext = LOGO_EXT[file.type];
    if (!ext) fail("Logo phải PNG/JPEG/WebP/SVG");
    const admin = createAdminClient();
    const path = `${session.userId}/logo.${ext}`;
    const up = await admin.storage
      .from("logos")
      .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: true });
    if (up.error) fail(up.error.message);
    logoPath = path;
  }

  const supabase = createClient();
  const { error } = await supabase.from("agent_branding").upsert({
    user_id: session.userId,
    display_name: parsed.data.display_name,
    phone: parsed.data.phone,
    zalo: parsed.data.zalo,
    position: parsed.data.position,
    logo_path: logoPath,
  });
  if (error) fail(error.message);
  revalidatePath("/settings");
  redirect("/settings?ok=1");
}
