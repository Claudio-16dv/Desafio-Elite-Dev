import { Module } from '@nestjs/common';
import { ReservationsModule } from '../reservations/reservations.module';
import { TicketsModule } from '../tickets/tickets.module';
import { OrdersController } from './orders.controller';
import { FakePaymentGateway } from './providers/fake-payment.gateway';
import { PaymentGateway } from './providers/payment.gateway';
import { PrismaOrdersRepository } from './repositories/prisma-orders.repository';
import { OrdersRepository } from './repositories/orders.repository';
import { CancelOrderUseCase } from './use-cases/cancel-order.use-case';
import { CheckoutUseCase } from './use-cases/checkout.use-case';
import { GetOrderUseCase } from './use-cases/get-order.use-case';

@Module({
  imports: [ReservationsModule, TicketsModule],
  controllers: [OrdersController],
  providers: [
    CheckoutUseCase,
    GetOrderUseCase,
    CancelOrderUseCase,
    { provide: OrdersRepository, useClass: PrismaOrdersRepository },
    { provide: PaymentGateway, useClass: FakePaymentGateway },
  ],
})
export class OrdersModule {}
