# 0004 — PostgreSQL, Supabase e conexão pooled

## Contexto
Precisamos de um banco relacional com boas garantias de concorrência (não vender o
mesmo lugar duas vezes) e hospedagem simples.

## Decisão
**PostgreSQL**. Local em Docker; produção no **Supabase**. No back serverless, usar a
conexão **pooled** do Supabase em `DATABASE_URL` (porta 6543) e a **direta** em
`DIRECT_URL` (porta 5432, para as migrations).

## Consequências
- MySQL foi descartado para não divergir do Supabase (que é Postgres) e evitar retrabalho.
- Sem pooling, as Functions esgotariam as conexões do Postgres.
