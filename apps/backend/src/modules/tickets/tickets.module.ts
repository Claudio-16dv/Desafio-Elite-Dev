import { Module } from '@nestjs/common';
import { TicketsController } from './tickets.controller';
import { HmacQrSigner } from './providers/hmac-qr-signer';
import { QrSigner } from './providers/qr-signer';
import { PrismaTicketsRepository } from './repositories/prisma-tickets.repository';
import { TicketsRepository } from './repositories/tickets.repository';
import { CreateShareLinkUseCase } from './use-cases/create-share-link.use-case';
import { GetTicketUseCase } from './use-cases/get-ticket.use-case';
import { ListMyTicketsUseCase } from './use-cases/list-my-tickets.use-case';
import { ViewSharedTicketUseCase } from './use-cases/view-shared-ticket.use-case';

@Module({
  controllers: [TicketsController],
  providers: [
    ListMyTicketsUseCase,
    GetTicketUseCase,
    CreateShareLinkUseCase,
    ViewSharedTicketUseCase,
    { provide: TicketsRepository, useClass: PrismaTicketsRepository },
    { provide: QrSigner, useClass: HmacQrSigner },
  ],
  exports: [TicketsRepository, QrSigner],
})
export class TicketsModule {}
