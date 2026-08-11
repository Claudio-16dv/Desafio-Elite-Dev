# 0003 — Deploy: tudo na Vercel

## Contexto
Projeto de teste, não será reutilizado. Queremos deploy simples e centralizado. O
avaliador roda local via Docker e usa a versão online apenas para experimentar.

## Decisão
Publicar front e back na **Vercel** (dois projetos, mesmo repositório). O back roda
como Vercel Function (há suporte oficial a NestJS). Banco no Supabase.

## Consequências
- Uma plataforma só; garante o ponto extra de "aplicação publicada".
- Produção não usa a imagem Docker — o Docker é para o ambiente local reprodutível.
- Por ser serverless: usar conexão pooled (ADR 0004) e evitar jobs de background (ADR 0005).
