import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectDetailBySlug,
  getProjectProvenance,
  districtAveragePrice,
} from "@/lib/data/projects";
import { buildTalkingPoints } from "@/lib/sales/talking-points";
import { getProjectMap } from "@/lib/data/project-map";
import { getSession } from "@/lib/auth";
import { ContentPanel } from "./ContentPanel";
import { ProjectKnowledgeMap } from "@/components/map/ProjectKnowledgeMap";
import type { Segment, ProjectStatus } from "@/lib/data/types";

const SEGMENT_VI: Record<Segment, string> = {
  luxury: "Hạng sang",
  "high-end": "Cao cấp",
  "mid-range": "Trung cấp",
  affordable: "Bình dân",
};
const STATUS_VI: Record<ProjectStatus, string> = {
  planning: "Quy hoạch",
  selling: "Mở bán",
  handover: "Bàn giao",
  completed: "Hoàn thành",
};

const FIELD_VI: Record<string, string> = {
  price_per_sqm: "Giá/m²",
  district: "Khu vực",
  developer: "Chủ đầu tư",
  segment: "Phân khúc",
  amenities: "Tiện ích",
};

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-slate-100">{value || "—"}</p>
    </div>
  );
}

export default async function LearningHub({ params }: { params: { slug: string } }) {
  const project = await getProjectDetailBySlug(params.slug);
  if (!project) notFound();

  const session = await getSession();
  const [provenance, districtAvg, projectMap] = await Promise.all([
    getProjectProvenance(project.id),
    districtAveragePrice(project.district, project.id),
    getProjectMap(project.id),
  ]);
  const isAdmin = session?.profile?.role === "admin";

  const talkingPoints = buildTalkingPoints({
    project,
    amenities: project.amenities,
    districtAvg,
  });

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-sm text-slate-400">
            {project.developer && `${project.developer} · `}
            {project.district}
            {project.city && `, ${project.city}`}
          </p>
        </div>
        <Link
          href={session ? "/app" : "/"}
          className="whitespace-nowrap text-sm text-slate-400 hover:text-slate-200"
        >
          ← {session ? "Trang dự án" : "Trang chủ"}
        </Link>
      </header>

      {/* Facts */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Fact label="Chủ đầu tư" value={project.developer} />
        <Fact label="Khu vực" value={project.district} />
        <Fact label="Phân khúc" value={SEGMENT_VI[project.segment]} />
        <Fact label="Trạng thái" value={STATUS_VI[project.status]} />
        <Fact
          label="Giá tham chiếu"
          value={project.pricePerSqmM > 0 ? `${project.pricePerSqmM} tr/m²` : ""}
        />
        {districtAvg && (
          <Fact label="TB khu vực" value={`~${districtAvg.toFixed(0)} tr/m²`} />
        )}
      </section>

      {/* Amenities */}
      {project.amenities.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Tiện ích
          </h2>
          <div className="flex flex-wrap gap-2">
            {project.amenities.map((a) => (
              <span
                key={a}
                className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200"
              >
                {a}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Per-project knowledge map */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Bản đồ tri thức dự án
          </h2>
          {isAdmin && (
            <Link
              href={`/app/projects/${project.slug}/map`}
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Chỉnh sửa bản đồ →
            </Link>
          )}
        </div>
        <ProjectKnowledgeMap data={projectMap.graph} notesById={projectMap.notesById} />
      </section>

      {/* Talking points — the core of the learning hub */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Gợi ý tư vấn (talking points)
        </h2>
        {talkingPoints.length === 0 ? (
          <p className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
            Chưa đủ dữ kiện để gợi ý. Quản trị viên hãy bổ sung thông tin dự án.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {talkingPoints.map((tp) => (
              <li key={tp.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
                <p className="text-sm text-slate-100">{tp.text}</p>
                <p className="mt-1 text-xs text-slate-500">Dựa trên: {tp.basis}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Lead-gen content — signed-in org members only */}
      {session && <ContentPanel slug={project.slug} />}

      {/* Provenance — where confirmed facts came from */}
      {provenance.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Nguồn dữ liệu (đã duyệt)
          </h2>
          <ul className="flex flex-col gap-2">
            {provenance.map((item, i) => (
              <li
                key={`${item.field}-${i}`}
                className="rounded-md border border-slate-800 bg-slate-950 p-3 text-xs"
              >
                <span className="text-slate-300">
                  {FIELD_VI[item.field] ?? item.field}: {item.value}
                </span>
                {item.source_span && (
                  <p className="mt-1 text-slate-500">…{item.source_span}…</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
