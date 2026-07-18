# CajuOS

Uma tool por semana. Pequenas ferramentas úteis, open source, feitas para durar.

Site estilo [Ollama](https://ollama.com): tipografia limpa, muito espaço em branco, grid de tools. White mode por padrão com toggle dark.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + Turbopack
- [Tailwind CSS](https://tailwindcss.com) v4
- [MDX](https://mdxjs.com) para blog, docs e changelog (versionado no git, sem CMS)
- Deploy na [Vercel](https://vercel.com)

## Estrutura

```
src/app/
├── page.tsx              → landing (hero + grid de tools)
├── tools/page.tsx        → índice de tools
├── tools/[slug]/page.tsx → página de cada tool
├── blog/page.tsx         → índice de posts
├── blog/[slug]/page.tsx  → post (MDX em src/content/blog)
├── changelog/page.tsx    → changelog global (MDX em src/content/changelog)
├── docs/[tool]/page.tsx  → docs de API por tool (MDX em src/content/docs)
├── about/page.tsx        → sobre + roadmap
├── feed.xml/route.ts     → RSS do blog
└── opengraph-image.tsx   → OG image global

src/lib/tools.ts          → registry das tools (adicionar tool aqui)
src/content/              → MDX de blog, docs e changelog
```

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
```

Build de produção:

```bash
npm run build
npm start
```

## Adicionar uma tool

1. Adicione o objeto em `src/lib/tools.ts` (`slug`, `name`, `tagline`, `icon`, `hasApi`, `launchedAt`).
2. Opcional: crie `src/content/blog/<slug>.mdx`, `src/content/docs/<slug>.mdx` e uma entrada em `src/content/changelog/global.mdx`.
3. O contador "Tool #N de ∞" no header/footer é automático.

## Deploy

Conecte o repo à Vercel (free tier). Cada push no `main` faz redeploy.

## Licença

MIT — o site e as tools client-side são abertos.
