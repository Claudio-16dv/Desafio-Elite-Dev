# Spec — Preparação de Ambiente

Arquivo único e executável. Contém contexto, requisitos, design e tarefas.
A execução acontece pela seção **Tarefas** no fim do arquivo.

---

## 1. Contexto e decisões

Fundação do projeto: monorepo, toolchain, banco, containers e deploy. As specs de
Back-end e Front-end constroem sobre esta base.

Decisões travadas (não reabrir):

- **Monorepo** com **npm workspaces**: `apps/backend`, `apps/frontend`, `packages/shared`
- **Node 22 LTS**
- **Back**: NestJS + Prisma — segue `.kiro/steering/arquitetura-backend.md`
- **Front**: Next.js App Router — segue `.kiro/steering/arquitetura-frontend.md`
- **Banco**: PostgreSQL — local em Docker, produção no **Supabase**
- **Deploy**: tudo na **Vercel** (2 projetos: front e back como Functions)
- **Local**: `docker compose up` sobe a stack inteira
- **Serverless**: conexão **pooled** do Supabase + expiração de reserva **preguiçosa** (sem cron)

---

## 2. Requisitos

**R1 — Monorepo (npm workspaces)**
- Workspaces na raiz cobrindo `apps/*` e `packages/*`; `npm install` único instala tudo.
- `packages/shared` importável pelos apps via `@app/shared`.
- Cada app com seu `package.json` e scripts (`dev`, `build`, `start`, `lint`, `test`).

**R2 — Toolchain e padrões**
- Node fixado em 22 (`.nvmrc` + `engines`); `tsconfig.base.json` compartilhado.
- ESLint + Prettier; script de lint na raiz cobre todos os workspaces.

**R3 — Pacote compartilhado**
- Expõe enums (`Role`, status de reserva/pedido/ingresso, resultado de validação) e contratos request/response.
- Consumível pelos dois apps sem quebrar build.

**R4 — Esqueleto back-end**
- `main.ts` + `app.module.ts`; módulo de config com **validação de env no boot**.
- `PrismaModule`/`PrismaService`; endpoint `GET /health`.
- Estrutura de pastas conforme steering (módulos vazios; sem regra de domínio aqui).

**R5 — Banco (Prisma + Postgres local + Supabase)**
- `schema.prisma` com `DATABASE_URL` (pooled em prod) e `DIRECT_URL` (migrations).
- Local aponta pro Postgres do Docker; scripts `migrate`/`generate`/`seed`.
- `seed.ts` como esqueleto (conteúdo obrigatório preenchido na Spec de Back-end).

**R6 — Esqueleto front-end**
- App Router + `layout.tsx` raiz + página inicial que renderiza.
- Esqueleto de `shared/api` (lê `NEXT_PUBLIC_API_URL`) e `shared/session` (`getSession` com `cache()` + provider).
- `output: 'standalone'` no `next.config`.

**R7 — Docker + Compose**
- Dockerfiles multi-stage (back e front).
- `docker-compose.yml` com `db`, `backend`, `frontend`, `healthcheck` e `depends_on`.
- `docker compose up` sobe tudo; migrations + seed aplicados ao subir.

**R8 — Deploy (Vercel + Supabase)**
- 2 projetos Vercel a partir do monorepo (roots `apps/frontend` e `apps/backend`).
- Back como Vercel Function (`vercel.json`); conecta ao Supabase **pooled**.
- Front aponta pro back via `NEXT_PUBLIC_API_URL`; segredos só como env vars na Vercel.

**R9 — Env e segredos**
- `.env.example` com todas as variáveis; `.env` no `.gitignore`.
- Falta de variável obrigatória derruba o boot com mensagem clara.

**R10 — Documentação e decisões**
- README com passo a passo local + deploy + limitações (ex.: cold start free tier).
- `docs/adr/` com decisões-chave (tudo na Vercel, pooled no serverless, expiração preguiçosa, monorepo).

---

## 3. Design técnico

### Layout do monorepo
```
desafio-elite-dev/
├── apps/
│   ├── backend/            # NestJS
│   └── frontend/           # Next.js
├── packages/
│   └── shared/             # @app/shared (enums + contratos)
├── docker-compose.yml
├── .env.example
├── .nvmrc                  # 22
├── tsconfig.base.json
├── package.json            # workspaces: ["apps/*", "packages/*"]
└── README.md
```

### Toolchain
- **npm workspaces**; scripts raiz delegam pros workspaces (`npm run lint -ws`, etc.).
- `tsconfig.base.json` com paths pro `@app/shared`; apps estendem a base.
- ESLint (flat config) + Prettier compartilhados.

### packages/shared
- `src/enums/` (Role, ReservationStatus, OrderStatus, TicketStatus, ValidationOutcome) e `src/contracts/`.
- Consumido como **TS source** via workspace + `paths` (sem etapa de build separada — mais simples).

### Back-end (esqueleto)
- `main.ts`: `ValidationPipe` global, exception filter global, CORS pro origin do front.
- `app.module.ts`: ConfigModule (com `env.validation`), PrismaModule, HealthController.
- `config/env.validation.ts`: valida variáveis no boot (falha cedo).
- Entrada serverless pra Vercel (handler que reusa a app Nest).

### Prisma / banco
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // local: Postgres do Docker | prod: Supabase pooled (6543)
  directUrl = env("DIRECT_URL")     // migrations: conexão direta (5432)
}
```
- Scripts: `prisma migrate dev` (local), `prisma migrate deploy` (prod/compose), `prisma generate`, `seed` (via `tsx`).
- Expiração de reserva **preguiçosa**: tratada ao ler/agir sobre hold vencido (definido na Spec de Back-end).

### Front-end (esqueleto)
- App Router, `layout.tsx` raiz (providers/fonte/tema), página inicial.
- `shared/api/client.ts`: wrapper de `fetch` com base `NEXT_PUBLIC_API_URL`.
- `shared/session/`: `get-session.ts` (`cache()`), `session-provider.tsx`, `use-session.ts`.
- `next.config`: `output: 'standalone'`.

### Docker
- **backend/Dockerfile**: `node:22-alpine`; stages deps → build (`prisma generate` + `nest build`) → runtime (só dist + deps de prod).
- **frontend/Dockerfile**: multi-stage; runtime a partir do `.next/standalone`.
- **docker-compose.yml**:
  - `db`: `postgres:16-alpine`, volume, `healthcheck` (`pg_isready`).
  - `backend`: `depends_on db (healthy)`; ao subir roda `migrate deploy` + `seed`; expõe a API.
  - `frontend`: `depends_on backend`; recebe `NEXT_PUBLIC_API_URL` apontando pro backend.

### Deploy Vercel
- Projeto **frontend** (root `apps/frontend`) e projeto **backend** (root `apps/backend`).
- `apps/backend/vercel.json`: roteia as requisições pro handler serverless do Nest.
- Env vars na Vercel (não commitadas); back usa Supabase **pooled**; front recebe a URL do back.

### Variáveis de ambiente (`.env.example`)
```
# --- backend ---
DATABASE_URL=            # local: postgres do docker | prod: supabase pooled (6543)
DIRECT_URL=              # migrations: conexão direta (5432)
JWT_SECRET=
JWT_EXPIRES_IN=1d
QR_SECRET=               # segredo do HMAC do QR
TMDB_API_KEY=
TMDB_BASE_URL=https://api.themoviedb.org/3
PORT=3333
CORS_ORIGIN=http://localhost:3000
# --- frontend ---
NEXT_PUBLIC_API_URL=http://localhost:3333
```

---

## 4. Tarefas (executável)

- [x] **1. Raiz do monorepo** (R1, R2)
  - `package.json` com `workspaces: ["apps/*","packages/*"]` e scripts raiz (lint/build/test)
  - `.nvmrc` (22) + `engines`; `tsconfig.base.json`; ESLint flat + Prettier
  - `.gitignore` (`node_modules`, `.env`, `.next`, `dist`, `prisma/*.db`)

- [x] **2. packages/shared** (R3)
  - enums: Role, ReservationStatus, OrderStatus, TicketStatus, ValidationOutcome
  - contratos request/response iniciais; `index.ts`; `paths` no tsconfig base

- [x] **3. Esqueleto back-end (NestJS)** (R4)
  - inicializar Nest em `apps/backend`; `main.ts` (pipe + filter globais + CORS)
  - `config/env.validation.ts` (valida no boot); `database/prisma` (module + service)
  - `GET /health`; pastas de módulos conforme steering (vazias)

- [x] **4. Prisma + banco** (R5)
  - `schema.prisma` (datasource `DATABASE_URL` + `directUrl`)
  - scripts `migrate`/`generate`/`seed`; `seed.ts` esqueleto

- [x] **5. Esqueleto front-end (Next)** (R6)
  - inicializar Next em `apps/frontend` (App Router, TS)
  - `layout.tsx` raiz + landing; `shared/api` skeleton; `shared/session` (getSession cache + provider)
  - `next.config` com `output: 'standalone'`

- [x] **6. Dockerfiles** (R7)
  - `apps/backend/Dockerfile` multi-stage (prisma generate + build)
  - `apps/frontend/Dockerfile` multi-stage (standalone)

- [x] **7. docker-compose.yml** (R7)
  - `db` (postgres + volume + healthcheck), `backend` (migrate deploy + seed + start), `frontend`
  - `depends_on` na ordem correta

- [x] **8. Env e segredos** (R9)
  - `.env.example` com todas as variáveis; `.env` no `.gitignore`; validação amarrada no boot

- [ ] **9. Deploy Vercel** (R8) — *fase posterior (no deploy)*
  - `apps/backend/vercel.json` (função serverless do Nest)
  - documentar 2 projetos Vercel + env vars + Supabase pooled
  - no deploy: `prisma migrate deploy` + seed no banco de produção (CD)

- [x] **10. Documentação** (R10)
  - `README` (setup local, deploy, limitações)
  - `docs/adr/` com as decisões-chave

- [x] **11. Verificação** (R4, R6, R7)
  - `docker compose up` sobe a stack inteira
  - `GET /health` responde ok; front carrega e alcança o back
