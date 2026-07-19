# CajuOS

Uma ferramenta útil por semana. Open source, roda no navegador, zero dependências externas.

[cajuos.dev](https://cajuos.dev)

## O que é

CajuOS é um experimento público de lançar uma ferramenta útil por semana. Cada tool resolve um problema pequeno e real — sem cadastro, sem instalação, sem coletar dados.

O código é aberto. As ferramentas client-side rodam 100% no navegador.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) + Turbopack
- [Tailwind CSS](https://tailwindcss.com) v4
- [MDX](https://mdxjs.com) para blog, docs e changelog
- [Resend](https://resend.com) para magic-link auth
- Deploy na [Vercel](https://vercel.com)

## Estrutura

```
src/
├── app/
│   ├── page.tsx              → landing
│   ├── tools/                → páginas das tools
│   ├── blog/                 → blog index + posts
│   ├── changelog/            → changelog
│   ├── docs/                 → documentação por tool
│   ├── admin/                → CMS protegido por magic-link
│   └── api/                  → API routes (auth + content)
├── components/               → componentes React
├── lib/
│   ├── tools.ts              → registry das tools
│   ├── content.ts            → leitura de MDX
│   ├── admin-content.ts      → save/read content via FS ou GitHub API
│   └── auth.ts               → JWT sign/verify (jose)
└── content/
    ├── blog/                 → posts em MDX
    ├── changelog/            → changelog entries em MDX
    └── docs/                 → documentação em MDX
```

## Rodar local

```bash
npm install
cp .env.example .env.local   # preencha as chaves
npm run dev                  # http://localhost:3000
```

### Variáveis de ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `RESEND_API_KEY` | Sim (admin) | API key do Resend pra enviar magic-link |
| `JWT_SECRET` | Sim (admin) | String secreta pra assinar tokens de sessão |
| `ADMIN_EMAIL` | Sim (admin) | Email que recebe o magic-link |
| `GITHUB_TOKEN` | Opcional | Token pra salvar MDX via GitHub API em prod |
| `NEXT_PUBLIC_UMAMI_SRC` | Não | URL do script Umami |
| `NEXT_PUBLIC_UMAMI_ID` | Não | Website ID do Umami |

## Adicionar uma tool

1. Adicione o objeto em `src/lib/tools.ts` (`slug`, `name`, `tagline`, `hasApi`, `launchedAt`)
2. Opcional: crie o componente em `src/components/` e registre em `tool-components.ts`
3. Adicione conteúdo:
   - Blog: `src/content/blog/<slug>.mdx`
   - Docs: `src/content/docs/<slug>.mdx`
   - Changelog: `src/content/changelog/<slug>.mdx`
4. O contador "Tool #N" no site é automático

## Admin

O painel admin em `/admin` permite criar e editar posts do blog e entradas do changelog via magic-link. A sessão dura 7 dias.

Em desenvolvimento os arquivos são salvos localmente. Em produção, se `GITHUB_TOKEN` estiver configurado, os MDX são commitados via GitHub API.

## Licença

MIT — o site e as tools client-side são abertos.

---

Feito com ☕ e o desejo de não ter que abrir Photoshop pra gerar uma imagem OG.
