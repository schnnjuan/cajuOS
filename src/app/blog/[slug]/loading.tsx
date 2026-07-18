export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-8 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-5/6 rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-4 w-4/6 rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  );
}
