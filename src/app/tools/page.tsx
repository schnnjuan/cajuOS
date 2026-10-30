import type { Metadata } from "next";
import { tools } from "@/lib/tools";
import { ToolsBrowser } from "@/components/tools-browser";

export const metadata: Metadata = {
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
    <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
      <section className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tools</h1>
        <p className="text-muted">{tools.length} ferramentas. Uma nova toda semana.</p>
      </section>
      <section className="mt-10">
        <ToolsBrowser tools={tools} />
      </section>
    </div>
  );
}