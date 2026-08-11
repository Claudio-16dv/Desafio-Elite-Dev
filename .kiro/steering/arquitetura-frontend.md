---
inclusion: fileMatch
fileMatchPattern: 'apps/frontend/**'
---

# Arquitetura do Front-end — Convenções do Projeto

Documento vivo. Toda tarefa no front-end **deve** seguir estas convenções. Fugas do
padrão vão para o ADR (`docs/adr/`) e este arquivo é atualizado.

## Princípio-guia

**Page burra, regra no server.** O front não reimplementa regra de negócio (isso é do
backend NestJS). Toda comunicação com o backend fica **isolada na camada de feature**
(Server Action para mutação, query server-side para leitura). **Page e componente
nunca falam com a API direto.**

## Stack

- **Next.js (App Router)** + **TypeScript** + **React Server Components**
- **Server Actions** para mutações
- Cliente HTTP tipado usando os contratos de `packages/shared`
- Autenticação por sessão (cookie/token) validada no server

## O fluxo de uma tela (espelha o back)

```
Page (fina)  →  Feature: query (leitura) / action (mutação)  →  shared/api  →  Backend (regra)
```

| Camada            | Responsabilidade                                                | Não pode |
|-------------------|-----------------------------------------------------------------|----------|
| Page / Layout     | Compor UI, chamar função de feature                             | Ter regra; importar `shared/api`; dar `fetch` |
| Feature `query`   | Leitura server-side: chama o backend e devolve dado             | Rodar no client |
| Feature `action`  | Mutação (`'use server'`): orquestra a chamada; token no server  | Conter regra de negócio (é do backend) |
| `shared/api`      | Cliente HTTP tipado                                             | Ser importado por page/componente |
| Componente UI     | Render + interação                                             | Falar com API; ter regra de negócio |

## Route groups + layouts

```text
src/app/
├── (public)/                     # sem login
│   ├── layout.tsx
│   ├── events/page.tsx           # busca/navegação
│   ├── events/[id]/page.tsx      # detalhe
│   ├── login/page.tsx
│   └── share/[token]/page.tsx    # ingresso compartilhado (só leitura)
│
├── (private)/                    # exige login
│   ├── layout.tsx                # auth-gate + carrega sessão 1x → SessionProvider
│   ├── (client)/
│   │   ├── layout.tsx            # nav do cliente + guarda de papel CLIENT
│   │   ├── checkout/[eventId]/page.tsx
│   │   └── my-tickets/page.tsx
│   ├── (organizer)/
│   │   ├── layout.tsx            # guarda de papel ORGANIZER
│   │   └── dashboard/page.tsx
│   └── (gate)/
│       ├── layout.tsx            # guarda de papel GATE
│       └── validate/page.tsx     # scanner de câmera + código manual
│
├── layout.tsx                    # root: providers globais, fonte, tema
└── globals.css
```

### Layout vs Page: o que carrega onde

- **Layout privado**: faz o auth-gate e carrega a **sessão/usuário/papel uma vez**.
  O `layout.tsx` não passa props pras pages → a sessão vai num **provider** (client) e,
  para Server Components, num `getSession()` com `cache()`. O layout não re-renderiza ao
  navegar entre pages irmãs, então carrega uma vez e mantém.
- **Regra**: no layout só o **essencial compartilhado** (usuário, papel). Dado específico
  de tela fica **na page**, senão toda página privada espera o layout.

## Estrutura de pastas

```text
apps/frontend/
├── src/
│   ├── app/                      # rotas: só layouts + pages finas
│   ├── features/                 # lógica por feature (espelha os módulos do back)
│   │   ├── auth/
│   │   │   ├── actions.ts        # 'use server': login, logout
│   │   │   ├── queries.ts        # leitura server-side (ex.: /me)
│   │   │   └── components/
│   │   ├── events/
│   │   │   ├── actions.ts
│   │   │   ├── queries.ts
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── checkout/
│   │   ├── tickets/
│   │   └── gate/
│   └── shared/
│       ├── api/                  # cliente HTTP tipado (usa @app/shared) — só a feature importa
│       ├── session/              # getSession() (cache) + SessionProvider + useSession()
│       ├── ui/                   # componentes próprios (identidade visual — anti-slop)
│       └── lib/
├── Dockerfile                    # multi-stage; next output: 'standalone'
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Exemplo — layout privado carrega a sessão uma vez

```tsx
// app/(private)/layout.tsx — Server Component
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();        // lê cookie/token, bate no /me (cache())
  if (!session) redirect('/login');

  return (
    <SessionProvider value={session}>        {/* client components: useSession() */}
      <AppShell user={session.user}>{children}</AppShell>
    </SessionProvider>
  );
}
```

## Exemplo — page fina consumindo uma query de feature

```tsx
// app/(private)/(client)/my-tickets/page.tsx — PAGE fina
import { getMyTickets } from '@/features/tickets/queries';
import { MyTicketsView } from '@/features/tickets/components/my-tickets-view';

export default async function MyTicketsPage() {
  const tickets = await getMyTickets();      // função de feature; a page NÃO chama api
  return <MyTicketsView tickets={tickets} />;
}
```

```ts
// features/tickets/queries.ts — leitura (server-only)
import 'server-only';
import { api } from '@/shared/api';

export async function getMyTickets() {
  return api.tickets.listMine();             // só a feature toca no cliente de API
}
```

## Exemplo — mutação via Server Action

```ts
// features/tickets/actions.ts
'use server';
import { api } from '@/shared/api';

export async function shareTicket(ticketId: string) {
  return api.tickets.createShareLink(ticketId);   // orquestra; a regra é do backend
}
```

## Exemplo — fronteira client isolada (portaria)

```tsx
// features/gate/components/qr-scanner.tsx
'use client';
export function QrScanner({ onScan }: { onScan: (code: string) => void }) {
  // usa a câmera do browser; mantém SÓ o scanner aqui
}
// A validação em si é uma Server Action (features/gate/actions.ts) chamada no onScan.
```

## Regras (do / don't)

- **Page e componente NUNCA importam `shared/api` nem dão `fetch`.** Todo acesso ao
  backend passa por `query` (leitura) ou `action` (mutação) da feature.
- Sem regra de negócio no front. Validação de UX (formulário, feedback) tudo bem;
  a regra de verdade é do backend.
- Mutação **sempre** via Server Action (`'use server'`). Nada de chamada de API no client.
- `client component` só quando precisa de API de browser (câmera, interatividade) —
  mantê-lo pequeno e isolado.
- Layout privado não sobrecarrega: só sessão/essencial compartilhado.
- Identidade visual própria em `shared/ui` (anti-slop; nada de cara de template default).
- Tipos vêm de `@app/shared` (o contrato com o back).

## Opcionais e onde encaixam

- **Mapa de assentos em tempo real**: `client component` isolado assinando o realtime
  (Supabase), com estado local. A fonte da verdade continua o backend.
- **Busca/filtro de eventos**: `query` server-side + parâmetros na URL (searchParams).
- **Cancelamento**: Server Action que chama o endpoint de cancelamento do backend.

## Checklist ao criar uma tela

- [ ] rota em `app/` com **page fina**
- [ ] layout de papel, se for área nova da parte privada
- [ ] leitura via `query` de feature; mutação via `action` (`'use server'`)
- [ ] page/componente **não** importam `shared/api` nem dão `fetch`
- [ ] componentes em `shared/ui` (reuso) ou `features/<x>/components` (específico)
- [ ] tipos vindos de `@app/shared`
