# 0005 — Expiração de reserva preguiçosa (sem cron)

## Contexto

Uma reserva (hold) expira após um tempo. Em serverless não há um processo de
background confiável para rodar um cron.

## Decisão

Expirar o hold de forma **preguiçosa**: ao ler ou agir sobre uma reserva vencida,
tratá-la como liberada (a entidade decide via `isExpired(now)`), em vez de um job
agendado.

## Consequências

- Não dependemos de agendador de nenhuma plataforma.
- O caminho de leitura precisa considerar holds vencidos como disponíveis.
