import Link from "next/link";
import { listDevelopers } from "@/lib/repo/developers";
import { createProject } from "@/app/(admin)/admin/_actions";
import { ProjectFields } from "@/app/(admin)/admin/projects/_ProjectFields";
import { Notice } from "@/app/(admin)/admin/_Notice";
import { Button } from "@/components/ui/button";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const devRes = await listDevelopers();
  const developers = devRes.ok ? devRes.data : [];
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dự án mới</h1>
        <Link href="/admin/projects" className="text-sm text-muted-foreground hover:text-foreground">← Danh sách</Link>
      </div>
      <Notice error={searchParams.error} />
      <form action={createProject} className="flex flex-col gap-4">
        <ProjectFields developers={developers} />
        <Button type="submit" className="self-start">Tạo dự án</Button>
      </form>
    </main>
  );
}
