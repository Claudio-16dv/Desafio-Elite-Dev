# Desafio Elite Dev — Plataforma de Eventos e Ingressos

Monorepo com back-end (NestJS) e front-end (Next.js). Um organizador publica eventos a
partir de um catálogo externo (TMDb); o cliente reserva lugar, paga de forma simulada,
recebe um ingresso com QR e pode compartilhá-lo por link; a portaria valida na entrada.

> **Estado atual:** ambiente preparado (Spec 1). As funcionalidades de back-end e
> front-end entram nas próximas specs.

## Stack

- **Monorepo**: npm workspaces
- **Back-end**: NestJS + Prisma (Node 22)
- **Front-end**: Next.js (App Router) + React
- **Banco**: PostgreSQL (local em Docker; produção no Supabase)
- **Deploy** (fase posterior): tudo na Vercel

## Estrutura

```
apps/
  backend/    # NestJS
  frontend/   # Next.js
packages/
  shared/     # @app/shared: enums e contratos (tipos) usados pelos dois
docs/adr/     # registro das decisões de arquitetura
.kiro/        # specs e convenções (steering)
```

## Pré-requisitos

- Docker + Docker Compose (caminho recomendado), ou
- Node 22 + npm (para rodar sem container)

## Rodando com Docker (recomendado)

```bash
docker compose up --build
```

- Front: http://localhost:3000
- API: http://localhost:3333/health
- Postgres: localhost:5432

Se a porta 3000 já estiver ocupada na sua máquina:

```bash
FRONTEND_PORT=3001 docker compose up --build
```

## Rodando sem Docker

```bash
npm install
cp .env.example .env               # ajuste as URLs do banco se necessário
docker compose up -d db            # um Postgres local
npm run build:shared
npm run prisma:generate -w @app/backend
npm run dev:backend                # http://localhost:3333
npm run dev:frontend               # http://localhost:3000
```

## Variáveis de ambiente

Ver `.env.example`. Principais: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `QR_SECRET`,
`TMDB_API_KEY`, `NEXT_PUBLIC_API_URL`. A validação roda no boot do back-end (falha cedo
se faltar variável obrigatória).

## Scripts úteis (raiz)

- `npm run build` — builda shared, backend e frontend
- `npm run lint` — lint em todos os workspaces
- `npm run format` — Prettier

## Deploy (fase posterior)

Front e back publicados na **Vercel** (dois projetos, mesmo repositório), banco no
**Supabase** (conexão pooled). No deploy, roda-se `prisma migrate deploy` + seed no
banco de produção. Os detalhes serão adicionados quando fecharmos o deploy.

## Limitações conhecidas

- O `seed` e os modelos de domínio ainda são esqueleto (entram na Spec de Back-end).
- Em free tier de deploy, a primeira requisição após ociosidade pode ter cold start.

## Decisões e convenções

- Decisões de arquitetura: `docs/adr/`
- Convenções de código (back e front): `.kiro/steering/`
