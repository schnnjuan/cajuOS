export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-10 h-40 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
