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
        Por que construir uma ferramenta nova toda semana durante{" "}
        {TOTAL_PLANNED} semanas seguidas? A resposta curta: porque projetos
        pequenos ensinam mais que projetos grandes.
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
          No começo de 2026 eu estava com uma lista de ideias pequenas — coisas
          que eu mesmo queria usar, mas que não existiam do jeito que eu
          precisava. Ferramentas de imagem, conversores, geradores, coisinhas
          de terminal. Nada que fosse mudar o mundo, tudo que fosse útil no dia
          seguinte.
        </p>
        <p className="text-pretty">
          O problema é que projetos pequenos não acabam se você deixa eles
          crescendo. Você começa com um conversor de CSV, uma semana depois
          está desenhando sistema de login, duas semanas depois tem um banco de
          dados e zero ferramentas funcionando.
        </p>
        <p className="text-pretty">
          A saída foi um limite duro: uma semana. Sete dias. Se não ficar
          pronto, corta. Se ficar, lança. A próxima é outro problema.
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
          Tool resolve um problema. App vira um ecossistema. O formato de tool
          força você a responder uma pergunta: &quot;qual é o menor produto
          viável que resolve isso?&quot;. Se a resposta for &quot;precisa de
          banco de dados, autenticação, fila, webhook e integração com
          Stripe&quot;, você escolheu o problema errado.
        </p>
        <p className="text-pretty">
          Além disso, tool é mais fácil de compartilhar. Manda o link, a pessoa
          usa, pronto. Não precisa criar conta, não precisa onboarding, não
          precisa tutorial de cinco minutos.
        </p>

        <h2>O que já saiu</h2>
        <p className="text-pretty">
          {tools.length} ferramentas lançadas até agora. Cada uma com sua
          história, seu post-mortem e seu código aberto.
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
          A lista de ideias é maior que o tempo disponível. Algumas coisas que
          estão na fila: mais ferramentas de imagem, conversores de formato,
          geradores de código, dashboards simples. E conforme o projeto cresce,
          as sugestões que chegam pelas issues do GitHub.
        </p>
        <p className="text-pretty">
          Se você tem uma ideia de tool que resolva um problema real, abre uma{" "}
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
          tempo, cada tool ganha seu post-mortem — o que deu certo, o que deu
          errado, quanto tempo levou, o que eu faria diferente. A ideia é que o
          registro público vire tanto documentação quanto entretenimento. A
          página de experimento também vai ser atualizada conforme o projeto
          andar, com as lições aprendidas no caminho.
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
