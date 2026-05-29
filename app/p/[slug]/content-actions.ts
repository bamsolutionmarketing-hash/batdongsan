"use server";

import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth";
import { getProjectDetailBySlug } from "@/lib/data/projects";
import { generateContent, type ContentFormat, type GeneratedContent } from "@/lib/sales/content";

export interface ContentState {
  result?: GeneratedContent;
  error?: string;
}

// Generate lead-gen content for a project and save it for reuse/history.
// Any signed-in org member can do this (it's the recurring sale tool).
export async function generateForProject(
  format: ContentFormat,
  slug: string,
): Promise<ContentState> {
  const session = await requireSession();
  const orgId = session.profile?.org_id;
  if (!orgId) return { error: "Tài khoản chưa thuộc tổ chức." };

  const project = await getProjectDetailBySlug(slug);
  if (!project) return { error: "Không tìm thấy dự án." };

  const result = generateContent(format, { project, amenities: project.amenities });

  const supabase = createClient();
  await supabase.from("content_suggestions").insert({
    org_id: orgId,
    project_id: project.id,
    format,
    rendered: { body: result.body },
    used_facts: { facts: result.usedFacts },
    missing_slots: result.missingSlots,
    status: "suggested",
  });

  return { result };
}
