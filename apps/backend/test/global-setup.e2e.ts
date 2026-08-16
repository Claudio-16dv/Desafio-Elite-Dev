import { execSync } from 'node:child_process';

export default function globalSetup(): void {
  // cria o banco de teste (ignora erro se já existir)
  try {
    execSync('docker compose exec -T db psql -U postgres -c "CREATE DATABASE elite_dev_test"', {
      stdio: 'ignore',
    });
  } catch {
    /* já existe */
  }
  // aplica a schema no banco de teste (DATABASE_URL/DIRECT_URL vêm do script test:e2e)
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
  });
}
