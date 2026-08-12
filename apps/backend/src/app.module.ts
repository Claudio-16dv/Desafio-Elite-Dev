import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { validateEnv } from './config/env.validation';
import { PrismaModule } from './database/prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { EventsModule } from './modules/events/events.module';
import { GateModule } from './modules/gate/gate.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReservationsModule } from './modules/reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    CatalogModule,
    EventsModule,
    ReservationsModule,
    OrdersModule,
    GateModule,
  ],
})
export class AppModule {}
