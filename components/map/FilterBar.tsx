"use client";

import type { Facets, FilterCriteria } from "@/lib/filter/filter";
import type { ProjectStatus, Segment } from "@/lib/data/types";

const SEGMENT_LABEL: Record<Segment, string> = {
  luxury: "Hạng sang",
  "high-end": "Cao cấp",
  "mid-range": "Trung cấp",
  affordable: "Bình dân",
};

const STATUS_LABEL: Record<ProjectStatus, string> = {
  planning: "Quy hoạch",
  selling: "Mở bán",
  handover: "Bàn giao",
  completed: "Hoàn thành",
};

interface FilterBarProps {
  facets: Facets;
  criteria: FilterCriteria;
  onChange: (next: FilterCriteria) => void;
  resultCount: number;
}

// Toggle a value in/out of one of the array-valued facet keys.
function toggle<T>(list: T[] | undefined, value: T): T[] {
  const set = new Set(list ?? []);
  set.has(value) ? set.delete(value) : set.add(value);
  return [...set];
}

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-sky-400 bg-sky-500/20 text-sky-100"
          : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-500"
      }`}
    >
      {label}
    </button>
  );
}

function ChipGroup<T extends string>({
  title,
  options,
  selected,
  labelOf,
  onToggle,
}: {
  title: string;
  options: T[];
  selected?: T[];
  labelOf: (v: T) => string;
  onToggle: (v: T) => void;
}) {
  if (options.length === 0) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-wide text-slate-500">{title}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <Chip
            key={opt}
            label={labelOf(opt)}
            active={(selected ?? []).includes(opt)}
            onClick={() => onToggle(opt)}
          />
        ))}
      </div>
    </div>
  );
}

export function FilterBar({ facets, criteria, onChange, resultCount }: FilterBarProps) {
  const hasActiveFacets =
    (criteria.segments?.length ?? 0) > 0 ||
    (criteria.districts?.length ?? 0) > 0 ||
    (criteria.developers?.length ?? 0) > 0 ||
    (criteria.statuses?.length ?? 0) > 0 ||
    Boolean(criteria.query?.trim());

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-center justify-between gap-3">
        <input
          type="search"
          value={criteria.query ?? ""}
          onChange={(e) => onChange({ ...criteria, query: e.target.value })}
          placeholder="Tìm theo tên dự án…"
          className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500"
        />
        {hasActiveFacets && (
          <button
            type="button"
            onClick={() => onChange({})}
            className="whitespace-nowrap rounded-md border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-slate-500"
          >
            Xóa lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ChipGroup
          title="Phân khúc"
          options={facets.segments}
          selected={criteria.segments}
          labelOf={(s) => SEGMENT_LABEL[s]}
          onToggle={(s) => onChange({ ...criteria, segments: toggle(criteria.segments, s) })}
        />
        <ChipGroup
          title="Trạng thái"
          options={facets.statuses}
          selected={criteria.statuses}
          labelOf={(s) => STATUS_LABEL[s]}
          onToggle={(s) => onChange({ ...criteria, statuses: toggle(criteria.statuses, s) })}
        />
        <ChipGroup
          title="Khu vực"
          options={facets.districts}
          selected={criteria.districts}
          labelOf={(d) => d}
          onToggle={(d) => onChange({ ...criteria, districts: toggle(criteria.districts, d) })}
        />
        <ChipGroup
          title="Chủ đầu tư"
          options={facets.developers}
          selected={criteria.developers}
          labelOf={(d) => d}
          onToggle={(d) => onChange({ ...criteria, developers: toggle(criteria.developers, d) })}
        />
      </div>

      <p className="text-xs text-slate-500">{resultCount} dự án khớp bộ lọc</p>
    </section>
  );
}
