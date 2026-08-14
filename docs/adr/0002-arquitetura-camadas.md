# 0002 — Arquitetura em camadas (back e front)

## Contexto

Teste para vaga júnior: precisa ser legível e defensável, sem over-engineering.

## Decisão

- **Back (NestJS)**: controller slim → use-case (orquestra) → entidade (regra) →
  repositório/providers (I/O). Regra de negócio isolada do framework.
- **Front (Next.js)**: page fina; regra no server; toda chamada ao back isolada na
  camada de feature (query para leitura, action para mutação). Page e componente
  nunca falam com a API direto.

Convenções completas em `.kiro/steering/arquitetura-backend.md` e
`.kiro/steering/arquitetura-frontend.md`.

## Consequências

- Estrutura previsível e testável nas invariantes (concorrência, QR, portaria).
- Abstrações só onde pagam o custo (ver a calibragem no steering do back).
