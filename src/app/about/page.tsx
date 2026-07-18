import { tools, TOTAL_PLANNED } from "@/lib/tools";

export const metadata = {
  title: "About",
  description: "Por que o CajuOS existe e para onde vai.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>

      <div className="prose prose-zinc mt-8 max-w-none dark:prose-invert">
        <p>
          O CajuOS é um experimento público: lançar uma ferramenta útil por
          semana, por {TOTAL_PLANNED} semanas. Cada tool resolve um problema
          pequeno e real, roda no browser e tem código aberto.
        </p>
        <h2>Por que</h2>
        <p>
          Ferramentas pequenas viciam pouco e ensinam muito. O desafio de uma
          por semana força foco e cria uma história que vale compartilhar.
        </p>
        <h2>Roadmap público</h2>
        <p>
          {tools.length} de {TOTAL_PLANNED} tools lançadas. Próximas: mais
          conversores, uma tool de imagem e APIs pagas pra quem não quer manter
          infra.
        </p>
        <h2>Open source</h2>
        <p>
          O site e as tools client-side são abertos. A lógica de APIs pagas fica
          privada. Veja tudo no GitHub.
        </p>
      </div>
    </div>
  );
}
