import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed. O conteúdo obrigatório (1 organizador, 2 clientes, 1 portaria e 1 evento
 * publicado com ingressos) será preenchido na Spec de Back-end, quando os modelos
 * de domínio existirem.
 */
async function main(): Promise<void> {
  console.log('[seed] placeholder — modelos de domínio entram na Spec de Back-end.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
