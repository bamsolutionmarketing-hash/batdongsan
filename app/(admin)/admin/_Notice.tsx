export function Notice({ error, ok }: { error?: string; ok?: string }) {
  if (error)
    return (
      <p className="rounded-md border border-red-900/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
        ⚠ {error}
      </p>
    );
  if (ok)
    return (
      <p className="rounded-md border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">
        ✓ Đã lưu
      </p>
    );
  return null;
}
