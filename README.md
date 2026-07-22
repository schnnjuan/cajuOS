<p align="center">
  <img src="https://raw.githubusercontent.com/schnnjuan/cajuOS/main/src/app/opengraph-image.png" alt="CajuOS">
</p>

# CajuOS

Uma tool por semana. Open source, roda no browser, zero dependências.

[cajuos.dev](https://cajuos.dev)

## O que é

Experimento público: lançar uma tool nova cada semana. Tudo client-side, sem cadastro, sem instalação, sem coleta de dados. Não guardo nada seu.

## Stack

- [Next.js](https://nextjs.org) 16 + Turbopack
- [Tailwind CSS](https://tailwindcss.com) v4
- [MDX](https://mdxjs.com) pra blog, docs e changelog
- [Resend](https://resend.com) pra magic-link auth
- Deploy na [Vercel](https://vercel.com)

## Estrutura

```
src/
├── app/
│   ├── page.tsx              → landing
│   ├── tools/                → tools
│   ├── blog/                 → blog
│   ├── changelog/            → changelog
│   ├── docs/                 → docs por tool
│   ├── admin/                → CMS (magic-link)
│   └── api/                  → routes
├── components/               → React
├── lib/
│   ├── tools.ts              → registry
│   ├── content.ts            → le MDX
│   ├── admin-content.ts      → salva MDX via FS ou GitHub API
│   └── auth.ts               → JWT (jose)
└── content/
    ├── blog/                 → posts MDX
    ├── changelog/            → entries MDX
    └── docs/                 → docs MDX
```

## Rodar local

```bash
npm install
cp .env.example .env.local
npm run dev
```

`http://localhost:3000`

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `RESEND_API_KEY` | Sim | Enviar magic-link |
| `JWT_SECRET` | Sim | Assinar token de sessão |
| `ADMIN_EMAIL` | Sim | Email do magic-link |
| `GITHUB_TOKEN` | Opcional | Salvar MDX via API em prod |
| `NEXT_PUBLIC_UMAMI_SRC` | Não | Umami script |
| `NEXT_PUBLIC_UMAMI_ID` | Não | Umami ID |

## Adicionar tool

1. Registra em `src/lib/tools.ts` (slug, name, tagline, hasApi, launchedAt)
2. Se tiver UI, cria componente em `src/components/` + `tool-components.ts`
3. Escreve o conteúdo em MDX em `src/content/` (blog, docs, changelog)
4. Contador "Tool #N" é automático

## Admin

`/admin` pra criar e editar blog/changelog via magic-link. Sessão dura 7 dias.

Em dev salva no filesystem. Em prod, se `GITHUB_TOKEN` existir, comita via GitHub API.

## Licença

MIT.
