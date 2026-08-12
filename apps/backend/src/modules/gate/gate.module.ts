import { Module } from '@nestjs/common';
import { TicketsModule } from '../tickets/tickets.module';
import { GateController } from './gate.controller';
import { ValidateTicketUseCase } from './use-cases/validate-ticket.use-case';

@Module({
  imports: [TicketsModule],
  controllers: [GateController],
  providers: [ValidateTicketUseCase],
})
export class GateModule {}
