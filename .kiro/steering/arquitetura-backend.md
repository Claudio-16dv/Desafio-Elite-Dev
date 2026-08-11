---
inclusion: fileMatch
fileMatchPattern: 'apps/backend/**'
---

# Arquitetura do Back-end — Convenções do Projeto

Documento vivo. Toda tarefa no back-end **deve** seguir estas convenções.

> **Contexto:** teste técnico para vaga **júnior**. A régua aqui é **simples e
> legível** — sem abstração que não pague o próprio custo. Estrutura organiza a
> complexidade que existe (concorrência, QR, papéis); não inventa complexidade.

## Princípio-guia

Regra de negócio isolada do framework. As dependências apontam para dentro: a
entidade não conhece NestJS, Prisma nem HTTP. I/O externo entra por uma **porta**
(interface) implementada por um **adaptador** — os dois moram em `providers/`
(ou `repositories/`, no caso de banco).

## Stack

- **NestJS** + **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL**: local em Docker; produção no **Supabase** (mesma schema, só troca a `DATABASE_URL`)
- **Auth**: JWT próprio, 3 papéis — `ORGANIZER`, `CLIENT`, `GATE`

## O fluxo de uma requisição

```
Controller (slim)  →  Use-case (orquestra)  →  Entidade (decide)
                                            →  Repositório / Providers (I/O)
```

| Camada        | Responsabilidade                                                   | Não pode |
|---------------|--------------------------------------------------------------------|----------|
| Controller    | Só HTTP: recebe DTO, chama o use-case, devolve                     | Ter regra; acessar Prisma |
| Use-case      | Orquestrar: buscar, chamar a regra, persistir. 1 arquivo, `execute()` | Conter invariante; importar Prisma |
| Entidade      | A regra: invariantes e transições de estado                        | Conhecer Nest/Prisma/HTTP |
| Repositório   | Porta + adaptador Prisma                                           | Vazar tipos do Prisma pro domínio |
| Providers     | Contrato de I/O externo + implementação (hasher, token, pagamento, QR, catálogo) | — |
| DTO           | Fronteira HTTP (entrada/saída)                                     | Vazar pro domínio |

### Régua de ouro: decidir vs coordenar

- `if` de regra de negócio → **entidade**.
- buscar / chamar / salvar → **use-case**.
- Se o use-case enche de `if` de regra, aquilo pertence à entidade.

## Estrutura de pastas

Dentro de cada módulo: `dto/`, `use-cases/`, `entities/`, `repositories/`
(porta + adaptador Prisma), `providers/` (outros ports + adaptadores), `errors/`
(quando houver erro de domínio).

```text
apps/backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                  # seed obrigatória: 1 organizador, 2 clientes, 1 portaria, 1 evento publicado
└── src/
    ├── main.ts
    ├── app.module.ts
    │
    ├── config/
    │   ├── app.config.ts
    │   └── env.validation.ts    # valida .env no boot (falha cedo)
    │
    ├── common/
    │   ├── decorators/          # @Roles(), @CurrentUser()
    │   ├── guards/              # jwt-auth.guard, roles.guard (trava os 3 papéis)
    │   ├── exceptions/          # domain.exception + domain-exception.filter (erro de domínio → HTTP)
    │   └── interceptors/        # logging.interceptor
    │
    ├── database/
    │   └── prisma/              # prisma.module.ts + prisma.service.ts
    │
    └── modules/
        ├── auth/                # login/register + persistência de usuário
        │   ├── auth.module.ts
        │   ├── auth.controller.ts
        │   ├── dto/
        │   ├── repositories/    # users.repository (porta) + prisma-users.repository (adaptador)
        │   ├── use-cases/       # login, register
        │   └── providers/       # password-hasher + bcrypt-...; token-provider + jwt-...
        │
        ├── events/              # CRUD + estado + catálogo externo (TMDb)
        │   ├── events.module.ts
        │   ├── events.controller.ts
        │   ├── dto/
        │   ├── entities/        # event.entity (DRAFT→PUBLISHED→CANCELLED, capacidade)
        │   ├── repositories/    # events.repository + prisma-events.repository
        │   ├── providers/       # catalog.provider (porta) + tmdb-catalog.provider (adaptador)
        │   └── use-cases/       # search-catalog, get-catalog-item, create, update, publish, cancel, get, list
        │
        ├── reservations/        # concorrência: não vender o mesmo lugar 2x
        │   ├── reservations.module.ts
        │   ├── reservations.controller.ts
        │   ├── dto/
        │   ├── entities/        # reservation.entity (HELD/CONFIRMED/RELEASED/EXPIRED, confirm(now), isExpired(now))
        │   ├── errors/          # seat-already-taken, reservation-expired, reservation-not-held
        │   ├── repositories/    # reservations.repository + prisma-... (usa $transaction + constraint)
        │   └── use-cases/       # hold-seats, confirm-reservation, release-reservation
        │
        ├── orders/              # pagamento simulado → emite ingresso
        │   ├── orders.module.ts
        │   ├── orders.controller.ts
        │   ├── dto/
        │   ├── entities/        # order.entity (PENDING→PAID→REFUSED/CANCELLED)
        │   ├── repositories/    # orders.repository + prisma-orders.repository
        │   ├── providers/       # payment.gateway (porta) + fake-payment.gateway (adaptador)
        │   └── use-cases/       # checkout, get-order, cancel-order (devolve ao estoque)
        │
        ├── tickets/             # ingresso: QR não-forjável + compartilhamento
        │   ├── tickets.module.ts
        │   ├── tickets.controller.ts
        │   ├── dto/
        │   ├── entities/        # ticket.entity (VALID→USED, markUsed(now) — valida 1x)
        │   ├── repositories/    # tickets.repository + prisma-tickets.repository
        │   ├── providers/       # qr-signer (porta, HMAC) + hmac-qr-signer (adaptador)
        │   └── use-cases/       # issue-ticket, list-my-tickets, get-ticket, create-share-link, view-shared-ticket
        │
        └── gate/               # portaria: máquina de estados (usa tickets repo + qr-signer)
            ├── gate.module.ts
            ├── gate.controller.ts
            ├── dto/            # validate-ticket, validation-result (VALID|INVALID|ALREADY_USED|WRONG_EVENT)
            └── use-cases/      # validate-ticket
```

> **QR:** o back-end gera e assina o **token** (HMAC). A **imagem** do QR é renderizada
> no front a partir desse token — não precisa gerador de imagem no back.

## Nomenclatura

- Use-case: `verbo-substantivo.use-case.ts` → classe `VerboSubstantivoUseCase`, método `execute()`
- Entidade: `nome.entity.ts`
- Repositório: `nome.repository.ts` (porta, `abstract class`) + `prisma-nome.repository.ts` (adaptador)
- Provider: `nome.ts` (porta) + `impl-nome.ts` (adaptador), ambos em `providers/`
- DTO: `acao.dto.ts` e `nome-response.dto.ts`
- Erro de domínio: `nome.error.ts` em `errors/`

## Injeção de dependência (porta ↔ adaptador)

O use-case injeta a **porta**; o módulo amarra a **implementação**:

```ts
@Module({
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: PasswordHasher,  useClass: BcryptPasswordHasher },
    { provide: TokenProvider,   useClass: JwtTokenProvider },
  ],
})
export class AuthModule {}
```

## Exemplo — controller slim + use-case

```ts
// auth/auth.controller.ts  → SÓ HTTP
@Controller('auth')
export class AuthController {
  constructor(private readonly login: LoginUseCase) {}

  @Post('login')
  @HttpCode(200)
  signIn(@Body() dto: LoginDto) {
    return this.login.execute(dto);
  }
}

// auth/use-cases/login.use-case.ts  → A REGRA DAQUELA CHAMADA
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: UsersRepository, // porta
    private readonly hasher: PasswordHasher,  // porta
    private readonly tokens: TokenProvider,   // porta
  ) {}

  async execute(input: LoginDto) {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();

    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) throw new InvalidCredentialsError();

    const accessToken = await this.tokens.sign({ sub: user.id, role: user.role });
    return { accessToken, role: user.role };
  }
}
```

## Exemplo — regra na entidade, use-case só orquestra

```ts
// reservations/entities/reservation.entity.ts  → A REGRA vive aqui
confirm(now: Date) {
  if (this.status !== ReservationStatus.HELD) throw new ReservationNotHeldError();
  if (this.isExpired(now)) throw new ReservationExpiredError();
  this.status = ReservationStatus.CONFIRMED;
}

// reservations/use-cases/confirm-reservation.use-case.ts  → só ORQUESTRA
async execute(id: string) {
  const reservation = await this.reservations.findById(id);
  if (!reservation) throw new ReservationNotFoundError();
  reservation.confirm(new Date());   // passa o tempo; no teste, passe uma data fixa
  await this.reservations.save(reservation);
}
```

## Exemplo — concorrência no adaptador (não vender 2x)

A transação e a trava ficam no **adaptador** do repositório, não no use-case:

```ts
// reservations/repositories/prisma-reservations.repository.ts
async holdSeats(eventId: string, seatIds: string[]) {
  return this.prisma.$transaction(async (tx) => {
    // unique(eventId, seatId) na schema impede o mesmo lugar duas vezes;
    // o insert do segundo comprador falha → erro de domínio.
    return tx.reservationSeat.createMany({
      data: seatIds.map((seatId) => ({ eventId, seatId /* ... */ })),
    });
  });
}
```

## Regras (do / don't)

- Controller **nunca** acessa Prisma nem contém regra.
- Use-case **nunca** importa Prisma; injeta a porta do repositório.
- Invariante **sempre** na entidade (evitar modelo anêmico).
- HTTP só nas bordas: use-case lança **erro de domínio**; o exception filter global
  traduz para status. Nada de `throw new HttpException` dentro do use-case.
- I/O externo atrás de porta: banco (repositório), TMDb, pagamento, QR.
- Concorrência: `prisma.$transaction` + constraint única no **adaptador**.
- Dinheiro: inteiro em **centavos**. Status: **enum** (sem value object).
- Configuração via `config/` com validação de env no boot.

## Calibragem (nível júnior) — o piso, não corte além disso

**Manter** (serve requisito obrigatório e testabilidade):
- repositório porta+adaptador em `events`, `reservations`, `orders`, `tickets`
- entidade com a regra + `errors/` de domínio em `reservations`
- providers de pagamento, QR e catálogo (TMDb)

**Não trazer de volta** (abstração que não paga o custo aqui):
- Clock port (a entidade recebe `now: Date` → já é testável)
- TransactionManager (usar `prisma.$transaction` direto no adaptador)
- value objects, módulo `users` separado, módulo `catalog` separado

`password-hasher`/`token-provider` podem ser concretos (sem interface) se quiser
enxugar mais; os **repositórios mantêm a interface** por causa dos testes.

## Testes (direcionados às invariantes)

- não vender o mesmo assento duas vezes (`reservations`)
- não validar o mesmo ingresso duas vezes (`gate`)
- QR não-forjável (`tickets` / `qr-signer`)

Repositórios com interface são mockáveis → testes de use-case/entidade unitários e rápidos.

## Checklist ao adicionar uma feature/módulo

- [ ] módulo em `modules/<nome>` com controller slim
- [ ] um use-case por operação (`execute`)
- [ ] invariantes na entidade (não no use-case)
- [ ] repositório porta + adaptador Prisma
- [ ] I/O externo atrás de provider
- [ ] DTOs de entrada e saída
- [ ] erro de domínio + tradução no exception filter
- [ ] teste da invariante, quando houver
