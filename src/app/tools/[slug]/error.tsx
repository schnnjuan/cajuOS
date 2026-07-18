"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Erro ao carregar</h1>
      <p className="mt-2 text-muted">Não foi possível exibir esta tool.</p>
      <button
        onClick={() => reset()}
        className="transition-[color,transform] duration-150 ease-out mt-6 text-sm underline underline-offset-4 hover:text-muted active:scale-95"
      >
        Tentar de novo
      </button>
    </div>
  );
}
