// Immediate feedback while the post page (and its image set) loads, so opening
// a post from the library never feels unresponsive.
export default function Loading() {
  return (
    <main className="mx-auto flex max-w-2xl animate-pulse flex-col gap-5 p-4 sm:p-6">
      <div className="h-7 w-40 rounded bg-muted" />
      <div className="h-32 rounded-lg bg-muted" />
      <div className="h-5 w-24 rounded bg-muted" />
      <div className="h-48 rounded-lg bg-muted" />
    </main>
  );
}
