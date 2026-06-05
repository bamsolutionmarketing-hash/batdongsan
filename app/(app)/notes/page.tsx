import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listNotes } from "@/lib/repo/notes";
import { createNote, toggleNote } from "./_actions";
import { Notice } from "@/app/(admin)/admin/_Notice";
import { Button } from "@/components/ui/button";

const input = "rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground";

export default async function NotesPage({ searchParams }: { searchParams: { error?: string; ok?: string } }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const res = await listNotes(session.userId);
  const notes = res.ok ? res.data : [];

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 p-4 sm:p-6">
      <h1 className="text-2xl font-bold">Ghi chú & nhắc hẹn</h1>
      <Notice error={searchParams.error} ok={searchParams.ok} />

      <form action={createNote} className="flex flex-wrap items-end gap-2 rounded-md border border-border bg-background p-3">
        <input name="text" placeholder="Vd: Gọi lại anh Tuấn về Gladia" className={`${input} flex-1`} required />
        <input name="remind_at" type="date" className={input} />
        <Button type="submit">Thêm</Button>
      </form>

      <ul className="flex flex-col gap-2">
        {notes.map((n) => (
          <li key={n.id} className="flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm">
            <form action={toggleNote}>
              <input type="hidden" name="id" value={n.id} />
              <input type="hidden" name="done" value={n.doneAt ? "0" : "1"} />
              <button className={`h-4 w-4 rounded border ${n.doneAt ? "border-emerald-500 bg-emerald-600" : "border-border"}`} title="Đánh dấu" />
            </form>
            <span className={n.doneAt ? "text-muted-foreground line-through" : "text-foreground"}>{n.text}</span>
            {n.remindAt && <span className="ml-auto text-xs text-muted-foreground">{n.remindAt}</span>}
          </li>
        ))}
        {notes.length === 0 && <p className="text-sm text-muted-foreground">Chưa có ghi chú.</p>}
      </ul>
    </main>
  );
}
