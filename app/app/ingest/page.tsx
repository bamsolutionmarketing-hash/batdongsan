import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listProjects } from "@/lib/data/projects";
import { UploadForm } from "./UploadForm";

export default async function IngestPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.profile?.org_id) redirect("/onboarding");
  if (session.profile.role !== "admin") redirect("/app");

  const projects = await listProjects();

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Nạp tài liệu dự án</h1>
        <p className="text-sm text-slate-400">
          Tải lên PDF / DOCX. Hệ thống trích xuất giá, khu vực, chủ đầu tư, phân khúc, tiện ích —
          mỗi trường kèm nguồn để bạn duyệt trước khi áp dụng.
        </p>
      </div>
      <UploadForm
        projects={projects.map((p) => ({ id: p.id, name: p.name }))}
      />
    </main>
  );
}
