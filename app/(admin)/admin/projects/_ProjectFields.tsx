import type { Project } from "@/types/domain";
import type { Developer } from "@/lib/repo/developers";

const input =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";
const label = "text-[11px] uppercase tracking-wide text-muted-foreground";

// Shared project form fields. `p` undefined → create mode.
export function ProjectFields({ p, developers }: { p?: Project; developers: Developer[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field name="name" label="Tên" def={p?.name} required />
      <Field name="slug" label="Slug" def={p?.slug} required />
      <div>
        <p className={label}>Chủ đầu tư</p>
        <select name="developer_id" defaultValue={p?.developerId ?? ""} className={input}>
          <option value="">—</option>
          {developers.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <Field name="phase" label="Phân khu/Phase" def={p?.phase ?? ""} />
      <Field name="location_text" label="Vị trí" def={p?.locationText ?? ""} />
      <Field name="status" label="Trạng thái" def={p?.status ?? "open"} />
      <Field name="price_min" label="Giá min (VND/m²)" def={p?.priceMin?.toString() ?? ""} type="number" />
      <Field name="price_max" label="Giá max (VND/m²)" def={p?.priceMax?.toString() ?? ""} type="number" />
      <Field name="view360_url" label="Link 360°" def={p?.view360Url ?? ""} />
      <div className="flex items-center gap-6 pt-2">
        <Check name="is_demo" label="Demo (free tier)" def={p?.isDemo} />
        <Check name="is_published" label="Đã xuất bản" def={p?.isPublished} />
      </div>
    </div>
  );
}

function Field({ name, label: l, def, type = "text", required }: {
  name: string; label: string; def?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <p className={label}>{l}{required && " *"}</p>
      <input name={name} defaultValue={def} type={type} required={required} className={input} />
    </div>
  );
}
function Check({ name, label: l, def }: { name: string; label: string; def?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <input type="checkbox" name={name} defaultChecked={def} className="h-4 w-4" />
      {l}
    </label>
  );
}
