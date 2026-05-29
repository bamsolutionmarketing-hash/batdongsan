"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";

export interface ProjectFormState {
  error?: string;
}

// URL-safe slug from a project name (keeps Vietnamese readable enough; the
// org+slug uniqueness constraint catches collisions).
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function parseForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("pricePerSqmM") ?? "").trim();
  const relatedRaw = String(formData.get("relatedIds") ?? "").trim();
  const amenitiesRaw = String(formData.get("amenities") ?? "").trim();
  return {
    name,
    developer: String(formData.get("developer") ?? "").trim(),
    district: String(formData.get("district") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim() || "TP.HCM",
    segment: String(formData.get("segment") ?? "mid-range"),
    status: String(formData.get("status") ?? "selling"),
    price_per_sqm_m: priceRaw ? Number(priceRaw) : null,
    visibility: formData.get("visibility") === "public" ? "public" : "org",
    attributes: {
      relatedIds: relatedRaw ? relatedRaw.split(",").map((s) => s.trim()).filter(Boolean) : [],
      amenities: amenitiesRaw ? amenitiesRaw.split(",").map((s) => s.trim()).filter(Boolean) : [],
    },
  };
}

export async function createProject(
  _prev: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const session = await requireSession();
  if (session.profile?.role !== "admin") return { error: "Chỉ quản trị viên mới được thêm dự án." };
  if (!session.profile.org_id) return { error: "Tài khoản chưa thuộc tổ chức nào." };

  const fields = parseForm(formData);
  if (!fields.name) return { error: "Vui lòng nhập tên dự án." };
  if (fields.price_per_sqm_m !== null && Number.isNaN(fields.price_per_sqm_m)) {
    return { error: "Giá/m² phải là số." };
  }

  const supabase = createClient();
  const { error } = await supabase.from("projects").insert({
    org_id: session.profile.org_id,
    slug: slugify(fields.name) || crypto.randomUUID().slice(0, 8),
    ...fields,
  });
  if (error) return { error: error.message };

  revalidatePath("/app");
  redirect("/app");
}
