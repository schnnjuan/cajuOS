import Link from "next/link";
import type { Metadata } from "next";
import { tools, toolProgressLabel, TOTAL_PLANNED, toolIndex } from "@/lib/tools";

export const metadata: Metadata = {
  title: "Experimento",
  description:
    "Uma tool por semana por tempo indeterminado. O plano, as regras e o que já saiu.",
  openGraph: {
    title: "Experimento · CajuOS",
    description:
      "Uma tool por semana por tempo indeterminado. O plano, as regras e o que já saiu.",
    url: "https://cajuos.dev/experiment",
  },
  twitter: {
    title: "Experimento · CajuOS",
    description:
      "Uma tool por semana por tempo indeterminado. O plano, as regras e o que já saiu.",
  },
  alternates: {
    canonical: "https://cajuos.dev/experiment",
  },
};

export default function ExperimentPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <Link
        href="/"
        className="transition-[color,transform] duration-150 ease-out text-sm text-muted hover:text-foreground active:scale-95"
      >
        ← Home
      </Link>

      <h1 className="mt-8 text-3xl font-semibold tracking-tight">
        Uma tool por semana
      </h1>
      <p className="mt-2 text-lg text-muted text-pretty">
        No começo de 2026 eu tinha uma lista de ideias pequenas. Coisas que eu
        mesmo queria usar. Ferramentas de imagem, conversores, geradores.
        Nada que fosse mudar o mundo. Tudo que fosse útil no dia seguinte.
      </p>

      {/* Progress */}
      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted">Progresso atual</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {toolProgressLabel()}
        </p>
        {tools.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tools.map((t) => {
              const i = toolIndex(t.slug);
              return (
                <Link
                  key={t.slug}
                  href={`/tools/${t.slug}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs transition-colors hover:border-foreground"
                >
                  <span className="text-accent">#{i + 1}</span>
                  {t.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="prose prose-zinc mt-10 max-w-none dark:prose-invert">
        <h2>Como começou</h2>
        <p className="text-pretty">
          Eu tinha uma lista de ideias pequenas. Ferramentas de imagem,
          conversores, geradores, coisinhas de terminal. Coisas que eu queria
          usar mas não existiam do jeito que eu precisava.
        </p>
        <p className="text-pretty">
          Projetos pequenos não acabam se você deixa eles crescendo. Você
          começa com um conversor de CSV. Uma semana depois está desenhando
          sistema de login. Duas semanas depois tem banco de dados e zero
          ferramentas funcionando.
        </p>
        <p className="text-pretty">
          Eu coloquei um limite: uma semana. Sete dias. Se não ficar pronto,
          corta. Se ficar, lança. A próxima tool é outro problema.
        </p>

        <h2>As regras</h2>
        <ul>
          <li>
            <strong>Uma tool por semana.</strong> Pode ser segunda a domingo,
            quarta a quarta, o ciclo que funcionar. O prazo é de sete dias.
          </li>
          <li>
            <strong>Roda no navegador.</strong> Nada de instalar, configurar
            ambiente, pagar conta. Abriu, usou.
          </li>
          <li>
            <strong>Código aberto.</strong> Tudo que é client-side vai pro
            repositório. APIs pagas ficam privadas, mas o site e as tools são
            públicos.
          </li>
          <li>
            <strong>Sem escopo creep.</strong> Se em sete dias não couber, não
            é uma tool, é um produto. Corta ou guarda pra depois.
          </li>
          <li>
            <strong>Tem que ter documentação.</strong> No mínimo um README, um
            post no blog e uma entrada no changelog. Tool sem história não
            existe.
          </li>
        </ul>

        <h2>Por que tool e não app</h2>
        <p className="text-pretty">
          O formato de tool força você a responder uma pergunta. Qual o menor
          produto viável que resolve isso? Se a resposta for &quot;precisa de
          banco de dados, autenticação, fila, webhook e integração com
          Stripe&quot;, você escolheu o problema errado.
        </p>
        <p className="text-pretty">
          Tool é mais fácil de compartilhar. Manda o link, a pessoa usa, pronto.
          Não precisa criar conta. Não precisa onboarding. Não precisa tutorial
          de cinco minutos.
        </p>

        <h2>O que já saiu</h2>
        <p className="text-pretty">
          {tools.length} ferramentas lançadas até agora. Cada uma tem seu
          post-mortem no blog e o código no GitHub.
        </p>

        {tools.length > 0 ? (
          <ul>
            {tools.map((t) => {
              const i = toolIndex(t.slug);
              return (
                <li key={t.slug}>
                  <Link href={`/tools/${t.slug}`} className="font-medium">
                    {t.name}
                  </Link>
                  <span className="text-muted">
                    {" "}
                    — Tool #{i + 1}. {t.tagline}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted">Nenhuma tool lançada ainda. Esta semana sai a primeira.</p>
        )}

        <h2>O que vem por aí</h2>
        <p className="text-pretty">
          A lista de ideias é maior que o tempo disponível. Mais ferramentas de
          imagem, conversores de formato, geradores de código, dashboards
          simples. E as sugestões que chegam pelas issues do GitHub.
        </p>
        <p className="text-pretty">
          Tem uma ideia? Abre uma{" "}
          <a
            href="https://github.com/schnnjuan/cajuOS/issues/new"
            target="_blank"
            rel="noopener noreferrer"
          >
            issue no repositório
          </a>
          . As melhores viram as próximas da fila.
        </p>

        <h2>Uma nota sobre o formato</h2>
        <p className="text-pretty">
          Esse texto é a primeira coisa que escrevi sobre o experimento. Com o
          tempo cada tool ganha seu post-mortem. O que deu certo, o que deu
          errado, quanto tempo levou. Coisas que só quem passou pela
          implementação sabe. A página de experimento também vai ser atualizada
          conforme o projeto andar.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link
          href="/tools"
          className="inline-flex items-center rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background no-underline transition-[color,transform] duration-150 ease-out hover:opacity-90 active:scale-95"
        >
          Ver tools
        </Link>
        <a
          href="https://github.com/schnnjuan/cajuOS"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-foreground"
        >
          GitHub
        </a>
        <Link
          href="/blog"
          className="inline-flex items-center transition-[color,transform] duration-150 ease-out underline underline-offset-4 hover:text-muted active:scale-95"
        >
          Blog →
        </Link>
      </div>
    </div>
  );
}
