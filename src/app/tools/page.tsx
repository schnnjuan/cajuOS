import { tools } from "@/lib/tools";
import { ToolCard } from "@/components/tool-card";

export const metadata = {
  title: "Tools",
  description: "Todas as ferramentas CajuOS.",
  openGraph: {
    title: "Tools",
    description: "Todas as ferramentas CajuOS.",
    url: "https://cajuos.dev/tools",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image.png"],
    title: "Tools",
    description: "Todas as ferramentas CajuOS.",
  },
  alternates: {
    canonical: "https://cajuos.dev/tools",
  },
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">Tools</h1>
      <p className="mt-2 text-muted">
        {tools.length} tools lançadas. Uma nova toda semana.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {tools.map((tool, i) => (
          <ToolCard key={tool.slug} tool={tool} index={i} />
        ))}
      </div>
    </div>
  );
}
