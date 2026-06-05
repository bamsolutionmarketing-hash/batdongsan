import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectById } from "@/lib/repo/projects";
import { nodesByProjectAll, linksByProject } from "@/lib/repo/nodes";
import { listDevelopers } from "@/lib/repo/developers";
import { ProjectFields } from "@/app/(admin)/admin/projects/_ProjectFields";
import { Notice } from "@/app/(admin)/admin/_Notice";
import { NODE_CATEGORIES } from "@/app/(admin)/admin/_constants";
import {
  updateProject, createNode, deleteNode, createLink, deleteLink,
} from "@/app/(admin)/admin/_actions";
import { Button } from "@/components/ui/button";

const input = "w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100";

export default async function EditProjectPage({
  params, searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string; ok?: string };
}) {
  const res = await getProjectById(params.id);
  if (!res.ok || !res.data) notFound();
  const project = res.data;

  const [devRes, nodesRes, linksRes] = await Promise.all([
    listDevelopers(),
    nodesByProjectAll(project.id),
    linksByProject(project.id),
  ]);
  const developers = devRes.ok ? devRes.data : [];
  const nodes = nodesRes.ok ? nodesRes.data : [];
  const links = linksRes.ok ? linksRes.data : [];
  const labelById = Object.fromEntries(nodes.map((n) => [n.id, n.label]));

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Link href="/admin/projects" className="text-sm text-slate-400 hover:text-slate-200">← Danh sách</Link>
      </div>
      <Notice error={searchParams.error} ok={searchParams.ok} />

      {/* Project fields */}
      <form action={updateProject} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={project.id} />
        <ProjectFields p={project} developers={developers} />
        <Button type="submit" className="self-start">Lưu dự án</Button>
      </form>

      {/* Nodes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Nodes ({nodes.length})</h2>
        <div className="flex flex-col gap-2">
          {nodes.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
              <span className="font-medium text-slate-100">{n.label}</span>
              <span className="text-xs text-slate-500">{n.category} · {n.nodeKey} · {n.facts.length} facts</span>
              <Link
                href={`/admin/projects/${project.id}/nodes/${n.id}/blocks`}
                className="ml-auto text-xs text-sky-400 hover:text-sky-300"
              >
                Blocks →
              </Link>
              <form action={deleteNode}>
                <input type="hidden" name="id" value={n.id} />
                <input type="hidden" name="project_id" value={project.id} />
                <button className="text-xs text-red-400 hover:text-red-300">Xóa</button>
              </form>
            </div>
          ))}
        </div>
        <details className="rounded-md border border-slate-800 bg-slate-950 p-3">
          <summary className="cursor-pointer text-sm text-sky-400">+ Thêm node</summary>
          <form action={createNode} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <input type="hidden" name="project_id" value={project.id} />
            <input name="node_key" placeholder="node_key (vd: lien-phuong)" className={input} required />
            <input name="label" placeholder="Nhãn" className={input} required />
            <select name="category" className={input} defaultValue="project">
              {NODE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="sub_label" placeholder="Sub-label" className={input} />
            <input name="sort_order" type="number" placeholder="sort_order" defaultValue="0" className={input} />
            <input name="talkpoint" placeholder="Talking point" className={`${input} sm:col-span-2`} />
            <textarea name="description" placeholder="Mô tả" rows={2} className={`${input} sm:col-span-2`} />
            <textarea name="facts" placeholder='facts JSON: [{"key":"Giá","value":"100tr/m²"}]' rows={3} className={`${input} sm:col-span-2 font-mono text-xs`} />
            <Button type="submit" className="self-start">Thêm node</Button>
          </form>
        </details>
      </section>

      {/* Links */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Links ({links.length})</h2>
        <div className="flex flex-col gap-2">
          {links.map((l) => (
            <div key={l.id} className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm">
              <span className="text-slate-200">{labelById[l.sourceNode] ?? "?"}</span>
              <span className="text-slate-500">→ {l.label ?? ""} →</span>
              <span className="text-slate-200">{labelById[l.targetNode] ?? "?"}</span>
              <form action={deleteLink} className="ml-auto">
                <input type="hidden" name="id" value={l.id} />
                <input type="hidden" name="project_id" value={project.id} />
                <button className="text-xs text-red-400 hover:text-red-300">Xóa</button>
              </form>
            </div>
          ))}
        </div>
        {nodes.length >= 2 && (
          <form action={createLink} className="grid grid-cols-1 gap-2 rounded-md border border-slate-800 bg-slate-950 p-3 sm:grid-cols-4">
            <input type="hidden" name="project_id" value={project.id} />
            <select name="source_node" className={input}>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <select name="target_node" className={input}>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.label}</option>)}
            </select>
            <input name="label" placeholder="Nhãn (vd: gần)" className={input} />
            <Button type="submit">Thêm link</Button>
          </form>
        )}
      </section>
    </main>
  );
}
