// Instant skeleton for every tab in the agent app. Without a loading boundary
// the old page stays frozen until the server responds (4–10 Supabase round
// trips) — tapping a tab felt dead. With it, navigation paints immediately.
export default function AppLoading() {
  return (
    <main className="mx-auto flex max-w-2xl animate-pulse flex-col gap-5 p-4 sm:p-6">
      <div className="h-8 w-40 rounded-lg bg-muted" />
      <div className="h-28 rounded-xl bg-muted" />
      <div className="h-20 rounded-xl bg-muted" />
      <div className="h-20 rounded-xl bg-muted" />
      <div className="h-12 w-2/3 rounded-xl bg-muted" />
    </main>
  );
}
