"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth";

export interface IngestState {
  error?: string;
  documentId?: string;
  count?: number;
}

interface RawExtraction {
  field: string;
  value: string;
  source_span: string;
  confidence: number;
  rule_id: string;
}

// Where the stateless Python extractor lives. Same origin in prod (Vercel),
// overridable for local dev where Python isn't running next to Next.
function extractorUrl(): string {
  const base = process.env.EXTRACTOR_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  return base ? `${base.replace(/\/$/, "")}/api/extract` : "/api/extract";
}

// Upload a file, run the rule engine, and store suggested extractions for review.
export async function uploadDocument(
  _prev: IngestState,
  formData: FormData,
): Promise<IngestState> {
  const session = await requireSession();
  const orgId = session.profile?.org_id;
  if (session.profile?.role !== "admin" || !orgId) {
    return { error: "Chỉ quản trị viên mới được nạp tài liệu." };
  }

  const file = formData.get("file");
  const projectId = String(formData.get("projectId") ?? "") || null;
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Vui lòng chọn tệp." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const admin = createAdminClient();

  // 1. Store the raw file in the org-scoped path.
  const path = `${orgId}/${Date.now()}-${file.name}`;
  const up = await admin.storage.from("documents").upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (up.error) return { error: `Lưu tệp thất bại: ${up.error.message}` };

  // 2. Record the document.
  const supabase = createClient();
  const { data: doc, error: docErr } = await supabase
    .from("documents")
    .insert({
      org_id: orgId,
      project_id: projectId,
      storage_path: path,
      filename: file.name,
      mime: file.type,
      status: "pending",
    })
    .select("id")
    .single();
  if (docErr) return { error: docErr.message };

  // 3. Run the stateless rule extractor.
  let extractions: RawExtraction[] = [];
  try {
    const res = await fetch(extractorUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        mime: file.type,
        content_base64: bytes.toString("base64"),
      }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "extractor failed");
    extractions = json.extractions as RawExtraction[];
  } catch (e) {
    await supabase.from("documents").update({ status: "error" }).eq("id", doc.id);
    return { error: `Trích xuất thất bại: ${(e as Error).message}`, documentId: doc.id };
  }

  // 4. Persist suggestions for admin review.
  if (extractions.length > 0) {
    const rows = extractions.map((e) => ({
      org_id: orgId,
      document_id: doc.id,
      project_id: projectId,
      field: e.field,
      value: e.value,
      source_span: e.source_span,
      confidence: e.confidence,
      status: "suggested",
    }));
    const { error: exErr } = await supabase.from("extractions").insert(rows);
    if (exErr) return { error: exErr.message, documentId: doc.id };
  }

  await supabase.from("documents").update({ status: "parsed" }).eq("id", doc.id);
  revalidatePath(`/app/ingest/${doc.id}`);
  return { documentId: doc.id, count: extractions.length };
}
