import Link from "next/link";
import { notFound } from "next/navigation";
import { getNodeById } from "@/lib/repo/nodes";
import { blocksByNode } from "@/lib/repo/blocks";
import { blockUsable } from "@/lib/engine/compliance";
import { createBlock, updateBlock, toggleBlock, deleteBlock } from "@/app/(admin)/admin/_block_actions";
import { uploadAsset, deleteAsset } from "@/app/(admin)/admin/_asset_actions";
import { assetsByNode } from "@/lib/repo/assets";
import { Notice } from "@/app/(admin)/admin/_Notice";
import { Button } from "@/components/ui/button";
import type { BlockRole } from "@/types/domain";

const input = "w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100";
const ROLES: BlockRole[] = ["hook", "body", "proof", "cta"];
const MIN = { hook: 3, body: 3, proof: 1, cta: 0 } as const;

export default async function BlocksPage({
  params, searchParams,
}: {
  params: { id: string; nodeId: string };
  searchParams: { error?: string; ok?: string };
}) {
  const nodeRes = await getNodeById(params.nodeId);
  if (!nodeRes.ok || !nodeRes.data) notFound();
  const node = nodeRes.data;
  const blocksRes = await blocksByNode(node.id);
  const blocks = blocksRes.ok ? blocksRes.data : [];
  const blocksErr = blocksRes.ok ? null : blocksRes.error;
  const assetsRes = await assetsByNode(node.id);
  const assets = assetsRes.ok ? assetsRes.data : [];

  const countByRole = (r: BlockRole) => blocks.filter((b) => b.role === r).length;
  const factKeyHint = node.facts.map((f) => f.key).join(", ");
  // Suggest the next free variant number so new blocks don't collide.
  const nextVariant = blocks.reduce((mx, b) => Math.max(mx, b.variantNo), 0) + 1;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blocks · {node.label}</h1>
          <p className="text-sm text-slate-500">{node.category} · {node.facts.length} facts</p>
        </div>
        <Link href={`/admin/projects/${params.id}`} className="text-sm text-slate-400 hover:text-slate-200">← Dự án</Link>
      </div>
      <Notice error={searchParams.error ?? blocksErr ?? undefined} ok={searchParams.ok} />

      {/* coverage */}
      <div className="flex flex-wrap gap-2 text-xs">
        {ROLES.map((r) => {
          const c = countByRole(r);
          const need = MIN[r];
          const okCov = c >= need;
          return (
            <span key={r} className={`rounded-full border px-3 py-1 ${okCov ? "border-emerald-800 text-emerald-300" : "border-amber-800 text-amber-300"}`}>
              {r}: {c}{need ? `/${need}` : ""}
            </span>
          );
        })}
      </div>

      {/* list */}
      <div className="flex flex-col gap-2">
        {blocks.map((b) => {
          const comp = blockUsable(
            { role: b.role, tone: b.tone, minConfidence: b.minConfidence, factKeys: b.factKeys },
            node.facts,
          );
          return (
            <div key={b.id} className="rounded-md border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="rounded bg-slate-800 px-2 py-0.5 text-slate-300">{b.role} · v{b.variantNo}</span>
                <span className="text-slate-500">{b.tone} · min {b.minConfidence}</span>
                {comp.usable ? (
                  <span className="text-emerald-400">● usable</span>
                ) : (
                  <span className="text-red-400" title={comp.reason ?? ""}>● blocked</span>
                )}
                {!b.isEnabled && <span className="text-slate-500">(tắt)</span>}
                <div className="ml-auto flex items-center gap-3">
                  <form action={toggleBlock}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="enabled" value={b.isEnabled ? "0" : "1"} />
                    <input type="hidden" name="node_id" value={node.id} />
                    <input type="hidden" name="project_id" value={params.id} />
                    <button className="text-xs text-slate-400 hover:text-slate-200">{b.isEnabled ? "Tắt" : "Bật"}</button>
                  </form>
                  <form action={deleteBlock}>
                    <input type="hidden" name="id" value={b.id} />
                    <input type="hidden" name="node_id" value={node.id} />
                    <input type="hidden" name="project_id" value={params.id} />
                    <button className="text-xs text-red-400 hover:text-red-300">Xóa</button>
                  </form>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-200">{b.text}</p>
              {b.factKeys.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">facts: {b.factKeys.join(", ")}</p>
              )}
              {!comp.usable && <p className="mt-1 text-xs text-red-400">⚠ {comp.reason}</p>}

              {/* inline edit */}
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-sky-400">Sửa</summary>
                <form action={updateBlock} className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <input type="hidden" name="id" value={b.id} />
                  <input type="hidden" name="node_id" value={node.id} />
                  <input type="hidden" name="project_id" value={params.id} />
                  <select name="role" className={input} defaultValue={b.role}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <input name="variant_no" type="number" min={1} defaultValue={b.variantNo} className={input} />
                  <select name="tone" className={input} defaultValue={b.tone}>
                    <option value="neutral">neutral</option>
                    <option value="fomo">fomo</option>
                    <option value="story">story</option>
                  </select>
                  <select name="min_confidence" className={input} defaultValue={b.minConfidence}>
                    <option value="verified">verified</option>
                    <option value="sales_claim">sales_claim</option>
                    <option value="unverified">unverified</option>
                  </select>
                  <textarea name="text" rows={3} defaultValue={b.text} className={`${input} sm:col-span-2`} required />
                  <input name="fact_keys" defaultValue={b.factKeys.join(", ")} placeholder={`fact keys (phẩy): ${factKeyHint}`} className={`${input} sm:col-span-2`} />
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" name="is_enabled" defaultChecked={b.isEnabled} className="h-4 w-4" /> Bật
                  </label>
                  <Button type="submit" className="self-start">Lưu</Button>
                </form>
              </details>
            </div>
          );
        })}
      </div>

      {/* create */}
      <details className="rounded-md border border-slate-800 bg-slate-950 p-3" open={blocks.length === 0}>
        <summary className="cursor-pointer text-sm text-sky-400">+ Thêm block</summary>
        <form action={createBlock} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input type="hidden" name="node_id" value={node.id} />
          <input type="hidden" name="project_id" value={params.id} />
          <select name="role" className={input} defaultValue="hook">
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <input name="variant_no" type="number" min={1} defaultValue={nextVariant} className={input} />
          <select name="tone" className={input} defaultValue="neutral">
            <option value="neutral">neutral</option>
            <option value="fomo">fomo</option>
            <option value="story">story</option>
          </select>
          <select name="min_confidence" className={input} defaultValue="verified">
            <option value="verified">verified</option>
            <option value="sales_claim">sales_claim</option>
            <option value="unverified">unverified</option>
          </select>
          <textarea name="text" rows={3} placeholder="Nội dung (chứa [TEN_SALE] [SDT] [LINK_360]…)" className={`${input} sm:col-span-2`} required />
          <input name="fact_keys" placeholder={`fact keys (phẩy): ${factKeyHint}`} className={`${input} sm:col-span-2`} />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" name="is_enabled" defaultChecked className="h-4 w-4" /> Bật
          </label>
          <Button type="submit" className="self-start">Thêm block</Button>
        </form>
      </details>

      {/* Assets */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ảnh ({assets.length})</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {assets.map((a) => (
            <div key={a.id} className="overflow-hidden rounded-md border border-slate-800 bg-slate-900">
              {a.signedUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.signedUrl} alt="" className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video w-full bg-slate-800" />
              )}
              <div className="flex items-center justify-between px-2 py-1 text-xs">
                <span className="text-slate-500">{a.safeZone}</span>
                <form action={deleteAsset}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="storage_path" value={a.storagePath} />
                  <input type="hidden" name="node_id" value={node.id} />
                  <input type="hidden" name="project_id" value={params.id} />
                  <button className="text-red-400 hover:text-red-300">Xóa</button>
                </form>
              </div>
            </div>
          ))}
        </div>
        <form action={uploadAsset} className="flex flex-wrap items-center gap-2 rounded-md border border-slate-800 bg-slate-950 p-3">
          <input type="hidden" name="node_id" value={node.id} />
          <input type="hidden" name="project_id" value={params.id} />
          <input type="file" name="file" accept="image/png,image/jpeg,image/webp" required className="text-sm text-slate-300" />
          <select name="safe_zone" className={input + " w-auto"} defaultValue="bottom_right">
            <option value="bottom_right">bottom_right</option>
            <option value="bottom_left">bottom_left</option>
            <option value="top_right">top_right</option>
            <option value="top_left">top_left</option>
          </select>
          <Button type="submit">Tải ảnh lên</Button>
        </form>
      </section>
    </main>
  );
}
