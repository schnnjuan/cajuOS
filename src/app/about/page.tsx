import { tools, TOTAL_PLANNED } from "@/lib/tools";

export const metadata = {
  title: "About",
  description: "Um experimento público de lançar uma ferramenta útil por semana.",
  openGraph: {
    title: "About",
    description: "Um experimento público de lançar uma ferramenta útil por semana.",
    url: "https://cajuos.dev/about",
  },
  twitter: {
    title: "About",
    description: "Um experimento público de lançar uma ferramenta útil por semana.",
  },
  alternates: {
    canonical: "https://cajuos.dev/about",
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>

      <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
        <p className="lead text-lg text-pretty">
          O CajuOS é um experimento público: lançar uma ferramenta útil por
          semana, por {TOTAL_PLANNED} semanas. Cada tool resolve um problema
          pequeno e real, roda no navegador e tem código aberto.
        </p>

        <hr className="my-10 border-border" />

        <h2>A ideia</h2>
        <p className="text-pretty">
          Ferramentas pequenas são mais faceis de manter. O formato de uma por
          semana força foco. Se não couber em sete dias, não é tool, é produto.
        </p>

        <h2>O que já tem</h2>
        <p className="text-pretty">
          {tools.length} de {TOTAL_PLANNED} tools. O roadmap segue aberto:
          mais conversores, ferramentas de imagem e APIs pagas pra quem não quer
          manter infra própria.
        </p>

        <hr className="my-10 border-border" />

        <h2>Código aberto</h2>
        <p className="text-pretty">
          O site e as tools client-side são abertos. A lógica de APIs pagas fica
          privada.{" "}
          <a
            href="https://github.com/schnnjuan/cajuOS"
            target="_blank"
            rel="noopener noreferrer"
          >
            Código no GitHub →
          </a>
        </p>

        <hr className="my-10 border-border" />

        <h2>Sugira uma tool</h2>
        <p className="text-pretty">
          Tem uma ideia pra próxima ferramenta? Abre uma issue no repositório
          descrevendo o problema que você quer resolver. As melhores viram as
          próximas tools da lista.
        </p>
        <p>
          <a
            href="https://github.com/schnnjuan/cajuOS/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background no-underline transition-[color,transform] duration-150 ease-out hover:opacity-90 active:scale-95"
          >
            Abrir issue
            <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M8 0a8 8 0 110 16A8 8 0 018 0zm.75 4.5l-1.06 1.06L9.44 7H4v1.5h5.44l-1.75 1.44 1.06 1.06L12 8 8.75 4.5z" />
            </svg>
          </a>
        </p>
      </div>
    </div>
  );
}
