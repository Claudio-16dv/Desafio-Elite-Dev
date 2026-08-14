# 0001 — Monorepo com npm workspaces

## Contexto

Back e front compartilham tipos (contratos de API, enums de papéis e status) e são
avaliados juntos.

## Decisão

Monorepo único com **npm workspaces** (`apps/backend`, `apps/frontend`,
`packages/shared`). Sem Turborepo/pnpm — npm workspaces resolve com menos ferramenta.

## Consequências

- Instalação única, commit atômico entre back e front, tipos via `@app/shared`.
- No deploy, cada app usa seu "root directory" (dois projetos Vercel no mesmo repo).
