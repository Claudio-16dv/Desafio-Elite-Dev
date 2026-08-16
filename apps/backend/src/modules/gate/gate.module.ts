import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { TicketsModule } from '../tickets/tickets.module';
import { GateController } from './gate.controller';
import { InspectTicketUseCase } from './use-cases/inspect-ticket.use-case';
import { ListGateEventsUseCase } from './use-cases/list-gate-events.use-case';
import { ValidateTicketUseCase } from './use-cases/validate-ticket.use-case';

@Module({
  imports: [EventsModule, TicketsModule],
  controllers: [GateController],
  providers: [InspectTicketUseCase, ListGateEventsUseCase, ValidateTicketUseCase],
})
export class GateModule {}
