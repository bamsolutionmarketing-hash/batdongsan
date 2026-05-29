import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReviewRow } from "./ReviewRow";

interface ExtractionRow {
  id: string;
  field: string;
  value: string;
  source_span: string | null;
  confidence: number | null;
  status: "suggested" | "confirmed" | "rejected";
}

export default async function ReviewPage({ params }: { params: { documentId: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.profile?.role !== "admin") redirect("/app");

  const supabase = createClient();
  const { data: doc } = await supabase
    .from("documents")
    .select("id, filename, status, project_id")
    .eq("id", params.documentId)
    .maybeSingle();

  const { data: extractions } = await supabase
    .from("extractions")
    .select("id, field, value, source_span, confidence, status")
    .eq("document_id", params.documentId)
    .order("field", { ascending: true });

  const rows = (extractions as ExtractionRow[]) ?? [];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Duyệt trích xuất</h1>
          <p className="text-sm text-slate-400">
            {doc?.filename ?? "Tài liệu"} · {rows.length} đề xuất
            {!doc?.project_id && " · chưa gắn dự án (xác nhận sẽ không áp dụng vào dự án nào)"}
          </p>
        </div>
        <Link href="/app/ingest" className="text-sm text-slate-400 hover:text-slate-200">
          ← Nạp tệp khác
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-slate-800 bg-slate-900 p-6 text-slate-400">
          Không trích xuất được trường nào. Bạn có thể nhập tay ở trang dự án.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <ReviewRow key={row.id} row={row} documentId={params.documentId} />
          ))}
        </ul>
      )}

      <Link
        href="/app"
        className="self-start rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
      >
        Xong — về trang dự án
      </Link>
    </main>
  );
}
