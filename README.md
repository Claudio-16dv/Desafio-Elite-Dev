# Desafio Elite Dev — Plataforma de Eventos e Ingressos

Aplicação web onde um **organizador** publica eventos (a partir de um catálogo externo de
filmes, o TMDb), o **cliente** escolhe assentos no mapa, paga de forma simulada (Stripe em
modo de teste) e recebe um **ingresso com QR Code** que pode compartilhar por link, e a
**portaria** valida o ingresso na entrada — cada porteiro só enxerga os eventos do
organizador que o cadastrou.

> **Demo online (é onde o pagamento funciona):** https://desafio-elite-dev-tau.vercel.app
>
> **Observação:** o back-end está no plano gratuito do Render e **hiberna** após um tempo
> ocioso. Por isso a **primeira requisição pode levar ~30–50s** (cold start) — depois que ele
> "acorda", a navegação fica normal.

O domínio central é: `User` (3 papéis) · `Event` + `Seat` · `Reservation` (+ `ReservationSeat`)
· `Order` · `Ticket`. Preço sempre em **centavos**; estados sempre em **enum**.

---

# Parte 1 — Descrição, stack e arquitetura

## Stack

**Monorepo & tooling**

- **npm workspaces** (um `npm install` na raiz), **TypeScript 5.7**, **Node 22**
- **ESLint** + **Prettier**
- **Docker / Docker Compose** para subir tudo localmente

**Back-end** (`apps/backend`)

- **NestJS 11** + **TypeScript**
- **Prisma 6** (ORM) sobre **PostgreSQL 16**
- **Auth**: JWT próprio (`passport-jwt`) + **bcrypt**; 3 papéis (`ORGANIZER`, `CLIENT`, `GATE`)
- **Zod** para validar as variáveis de ambiente no boot (falha cedo)
- **Stripe SDK** (modo de teste) para pagamento; ingresso com **QR assinado por HMAC**
- **Jest** para testes (unitários + integração)

**Front-end** (`apps/frontend`)

- **Next.js 15** (App Router) + **React 19** — Server Components + Server Actions
- **Tailwind CSS 4** + **Radix UI** + **CVA** (design system próprio em `shared/ui`)
- **react-hook-form** + **Zod** (validação de formulário)
- **@stripe/react-stripe-js** (Stripe Elements) para o checkout
- **qrcode.react** (renderiza a imagem do QR) + **@zxing/browser** (leitor de QR pela câmera)
- **motion** (animações), **sonner** (toasts), **lucide-react** (ícones)
- **Vitest** + **Testing Library** + **jsdom** para testes

**Pacote compartilhado** (`packages/shared`)

- **`@app/shared`**: enums e contratos de tipos (request/response) usados pelos dois lados

**Produção**

- Front na **Vercel**, back no **Render** (Docker), banco no **Supabase** (Postgres gerenciado)

## Estrutura de pastas

```text
Desafio-Elite-Dev/
├── apps/
│   ├── backend/      # API NestJS
│   └── frontend/     # App Next.js
├── packages/
│   └── shared/       # @app/shared — enums + contratos (o contrato back ↔ front)
├── docs/adr/         # decisões de arquitetura registradas
├── docker-compose.yml
├── Dockerfile.test   # imagem só para rodar os testes no Docker
└── .env.example      # um único .env na raiz cobre back + front
```

### Back-end (`apps/backend`)

```text
apps/backend/
├── prisma/
│   ├── schema.prisma     # modelos: User, Event, Seat, Reservation, ReservationSeat, Order, Ticket
│   ├── migrations/       # migrations versionadas
│   └── seed.ts           # popula 4 usuários + 12 eventos (usa TMDb; sem chave, cai num catálogo local)
└── src/
    ├── main.ts           # bootstrap: CORS, validação global, filtro de erro de domínio
    ├── app.module.ts
    ├── config/           # env.validation (Zod), app.config, stripe.config
    ├── common/           # guards (JWT + papéis), filtro de exceção de domínio, decorators
    ├── database/prisma/  # PrismaModule + PrismaService
    ├── health/           # GET /health
    └── modules/
        ├── auth/         # login / registro (JWT + hash de senha)
        ├── catalog/      # busca no catálogo externo (TMDb)
        ├── events/       # CRUD de evento + estados (DRAFT → PUBLISHED → CANCELLED)
        ├── reservations/ # reserva de assento — concorrência: não vender o mesmo lugar 2x
        ├── orders/       # checkout + pagamento (Stripe) + webhook + cancelamento
        ├── tickets/      # emissão do ingresso, QR assinado (HMAC), compartilhamento por link
        └── gate/         # portaria: valida o ingresso (1x) no escopo do organizador
```

Cada módulo segue o mesmo desenho: **controller** (só HTTP) → **use-case** (orquestra) →
**entity** (a regra/invariante) → **repository** (porta + adaptador Prisma) / **providers**
(I/O externo atrás de porta: pagamento, QR, catálogo), com **dto/** e **errors/** de domínio.

### Front-end (`apps/frontend`)

```text
apps/frontend/
└── src/
    ├── app/                    # rotas do App Router: só layouts + páginas finas
    │   ├── (public)/           # sem login: events, events/[id], login, register, share/[token]
    │   └── (private)/          # exige login (auth-gate + sessão carregada 1x no layout)
    │       ├── (client)/       # checkout/[eventId], my-tickets, orders
    │       ├── (organizer)/    # dashboard, dashboard/gates/new
    │       ├── (gate)/         # validate (leitor de QR + código manual)
    │       └── account/
    ├── features/               # lógica por feature (espelha os módulos do back)
    │   │                       # auth · events · checkout · orders · tickets · gate · account · home
    │   └── <feature>/
    │       ├── actions.ts      # 'use server': mutações
    │       ├── queries.ts      # leitura server-side
    │       ├── schema.ts       # validação de UX (Zod)
    │       └── components/
    └── shared/
        ├── api/                # cliente HTTP tipado (só a camada de feature importa)
        ├── session/            # getSession() + SessionProvider + useSession()
        ├── ui/                 # design system próprio (Radix + Tailwind)
        └── lib/
```

### Pacote compartilhado (`packages/shared`)

```text
packages/shared/src/
├── enums/       # Role, EventStatus, ReservationStatus, OrderStatus, TicketStatus, ValidationOutcome
├── contracts/   # tipos de request/response — o contrato entre back e front
└── index.ts
```

## Por que essa arquitetura (direto ao ponto)

- **Monorepo + `@app/shared`**: um pacote com enums e contratos importado pelos dois lados.
  O que o back devolve e o que o front espera **não divergem** — muda o tipo num lugar só.
- **Back em camadas (Clean Architecture enxuta)**: regra de negócio **isolada** do NestJS,
  do Prisma e do HTTP. Isso deixa a regra **testável com mocks** e legível. As invariantes
  moram na **entidade** (nada de modelo anêmico); o use-case só **orquestra** (buscar,
  chamar a regra, salvar).
- **Concorrência sem drama**: "não vender o mesmo assento 2x" é garantido por **constraint
  única no banco + `$transaction`** no adaptador do repositório — simples e correto sob corrida.
- **Front "página burra, regra no server"**: Server Components para leitura e Server Actions
  para mutação; todo acesso à API fica **isolado na camada de feature** (página e componente
  nunca chamam a API direto). Sem regra de negócio duplicada no cliente.
- **Postgres + Prisma**: a **mesma schema** roda local (Docker) e em produção (Supabase) —
  só muda a `DATABASE_URL`. Migrations versionadas.
- **Pagamento com Stripe em modo de teste (sandbox)**: o gateway fica **atrás de uma porta**;
  o **webhook** confirma o pagamento e dispara a emissão do ingresso. Nunca chave _live_,
  nunca cobrança real.
- **QR não-forjável**: o back gera e assina o **token** (HMAC); a **imagem** do QR é
  desenhada no front a partir desse token (não precisa de gerador de imagem no back).
- **Calibragem júnior**: estrutura só onde paga o custo (concorrência, QR, papéis). Sem
  abstração pela abstração.

---

# Parte 2 — Rodando localmente com Docker

Tudo (banco, back e front) roda em container — não precisa de Node nem Postgres na máquina.

## Pré-requisitos

- **Docker** + **Docker Compose**.
- (opcional) Node 22 + `nvm use`, apenas se for abrir/editar o código fora do container.

## Subir o projeto

```bash
cp .env.example .env      # já vem pronto (com placeholders); não precisa editar nada para subir
docker compose up --build
```

- Front: http://localhost:3000
- API (health): http://localhost:3333/health
- Postgres: `localhost:5432`

O compose já cria o banco, roda as **migrations** e a **seed** automaticamente. Se a porta
3000 estiver ocupada, use: `FRONTEND_PORT=3001 docker compose up --build`.

## Sobre o pagamento (importante)

O pagamento com Stripe **só funciona em produção** (na demo online), porque depende de
chaves reais do Stripe que **não** ficam no repositório. Para o projeto **subir sem erro**
localmente, o `.env.example` já traz **placeholders** de Stripe — eles só existem para passar
na validação de boot.

Ou seja: **localmente dá para instalar e testar tudo**, menos o pagamento em si — ao tentar
pagar no checkout, a cobrança vai falhar (é o esperado). Para ver o fluxo de pagamento
completo, use a **demo online**: https://desafio-elite-dev-tau.vercel.app

## O arquivo `.env` (referência)

Um **único `.env` na raiz** atende back e front, e já está conferido e completo. No modo
Docker, o próprio `docker-compose.yml` já define o banco e os segredos dos containers — então,
para rodar local, **não precisa editar nada**. As variáveis:

| Variável                                               | Editar no local?     | O que é                                                              |
| ------------------------------------------------------ | -------------------- | -------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`                                    | não (placeholder)    | Chave secreta do Stripe; valor real (`sk_test_…`) **só em produção** |
| `STRIPE_WEBHOOK_SECRET`                                | não (placeholder)    | Segredo do webhook do Stripe; valor real **só em produção**          |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`                   | não (placeholder)    | Chave pública do Stripe (`pk_test_…`); valor real **só em produção** |
| `TMDB_API_KEY`                                         | opcional             | Catálogo real de filmes; **sem ela**, o seed usa um catálogo local   |
| `DATABASE_URL` / `DIRECT_URL`                          | não (compose define) | Postgres da aplicação (em produção: conexão _pooled_ do Supabase)    |
| `JWT_SECRET` / `QR_SECRET`                             | não (compose define) | Segredos do JWT e do HMAC do QR                                      |
| `API_URL`                                              | não (compose define) | URL da API para o front acessar o back (server-side)                 |
| `RESERVATION_TTL_MINUTES`                              | não (padrão 5)       | Janela em que a reserva fica `HELD` antes de liberar sozinha         |
| `JWT_EXPIRES_IN` / `CORS_ORIGIN` / `PORT` / `NODE_ENV` | não                  | Ajustes finos, com padrões sensatos                                  |

## Testes (dentro do Docker)

Roda as três suítes num container dedicado, na mesma rede do Postgres:

```bash
docker compose --profile test run --rm tests
```

- **Unitários do back** (Jest, sem banco) + **testes do front** (Vitest) + **integração do
  back** (Jest, contra um banco separado `elite_dev_test` no mesmo Postgres — sem tocar nos
  dados da aplicação).
- Na primeira vez ele constrói a imagem de teste (`Dockerfile.test`, com as dependências de
  desenvolvimento). As execuções seguintes reaproveitam o cache.

---

# Parte 3 — O que dá para testar

## Usuários (seed) — senha de todos: `senha123`

| E-mail                | Papel     | Para quê                                                                                                                             |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `organizer@elite.dev` | ORGANIZER | Cria/publica/cancela eventos, cadastra a portaria, vê o dashboard                                                                    |
| `cliente1@elite.dev`  | CLIENT    | **Já vem com 2 ingressos pagos** (evento "Show de Exemplo", assentos A1/A2) — ótimo para ver ingresso, QR e compartilhamento na hora |
| `cliente2@elite.dev`  | CLIENT    | Cliente "limpo" para fazer a compra do zero                                                                                          |
| `portaria@elite.dev`  | GATE      | Valida ingressos — **só dos eventos do `organizer@elite.dev`**                                                                       |

O seed cria **12 eventos** (o "Show de Exemplo" + 11 vindos do TMDb; sem `TMDB_API_KEY`,
usa um catálogo local de fallback), cada um com seu mapa de assentos.

## Cartões de teste do Stripe (só na demo online)

O pagamento só roda na demo. Use **qualquer data de validade futura** (ex.: `12/34`),
**qualquer CVC** de 3 dígitos e **qualquer CEP**. O Stripe **não aceita** número de cartão
inventado — use os oficiais:

| Número                | Resultado                           |
| --------------------- | ----------------------------------- |
| `4242 4242 4242 4242` | Pagamento **aprovado**              |
| `4000 0000 0000 0002` | **Recusado** (genérico)             |
| `4000 0000 0000 9995` | Recusado por **saldo insuficiente** |
| `4000 0025 0000 3155` | Exige **autenticação 3D Secure**    |

Lista completa: https://docs.stripe.com/testing
Obs.: **Pix não está disponível** — a conta de teste liberou só cartão. O cartão é o
caminho garantido.

## Fluxos para testar por papel

**Cliente** (entre com `cliente2@elite.dev`)

1. Navegue em **/events**, use os filtros (busca, faixa de data, faixa de preço).
2. Abra um evento e **escolha assentos** no mapa (limite de **10** por reserva; ocupados
   não são selecionáveis).
3. Vá ao **checkout** (na demo online, pague com `4242 4242 4242 4242` → pedido vira **PAID**).
4. Em **/my-tickets**, veja o ingresso com **QR**; gere um **link de compartilhamento**.
5. Em **/orders**, teste o **cancelamento** do pedido (a API de teste não devolve dinheiro
   real; o status apenas muda).

**Cliente com ingresso pronto** (`cliente1@elite.dev`): já tem 2 ingressos pagos — dá para
ver o QR e o compartilhamento imediatamente, sem comprar.

**Organizador** (`organizer@elite.dev`)

1. No **/dashboard**, crie um evento (buscando no catálogo TMDb ou preenchendo manual) e
   **publique**.
2. **Cadastre uma portaria** em _dashboard → gates/new_ (ela fica ligada a você).
3. Teste o **cancelamento** de um evento.

**Portaria** (`portaria@elite.dev`)

1. Em **/validate**, escolha um evento **do seu organizador** (só esses aparecem).
2. Valide um ingresso pela **câmera** (QR) ou digitando o **código**.
   - Sem dois aparelhos, use o **código manual** de um ingresso da seed do "Show de Exemplo":
     **`SEEDAATKTA`** (assento A1) ou **`SEEDBBTKTB`** (assento A2).
   - Primeira validação → **VALID** (confirma presença). Segunda vez com o mesmo código →
     **ALREADY_USED** (não valida o mesmo ingresso 2x).
   - Rode o seed de novo para resetar os ingressos para `VALID`.

## Outros comportamentos que valem conferir

- **E-mail duplicado**: registrar um cliente ou cadastrar uma portaria com um e-mail que já
  existe (ex.: `organizer@elite.dev`) retorna **409 Conflito** — a API trata o caso.
- **Reserva com validade**: um assento reservado fica `HELD` por `RESERVATION_TTL_MINUTES`
  (padrão 5); passando isso, ele é liberado para outra pessoa.
- **Evento esgotado / cancelado**: eventos sem disponibilidade ou cancelados não deixam
  iniciar uma nova compra.

---

## Como a IA foi usada neste projeto

As **decisões de arquitetura e de produto foram minhas**: como o projeto seria organizado, o
back-end em camadas (controller → use-case → entidade → repositório/porta), o padrão "página
burra, regra no server" no front, as convenções de código, o recorte de escopo e os tradeoffs
de cada escolha. Essas decisões ficaram registradas nas convenções do projeto
(`.kiro/steering/`) e nos ADRs (`docs/adr/`).

Usei a IA (Kiro) principalmente como **ferramenta de codificação**: implementar o que eu já
tinha decidido, escrever código e testes seguindo os padrões que defini, acelerar as partes
repetitivas e servir de par na hora de revisar. A direção técnica, as decisões de design e a
conferência do que entrou no projeto foram minhas — a IA executou dentro desse desenho.

---

## Documentação interna

- Decisões de arquitetura: `docs/adr/`
- Convenções de código (back e front): `.kiro/steering/`
