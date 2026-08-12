import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3333', 10),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  reservationTtlMinutes: Number(process.env.RESERVATION_TTL_MINUTES ?? 10),
}));
