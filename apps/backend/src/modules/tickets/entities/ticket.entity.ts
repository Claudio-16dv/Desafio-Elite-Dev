import { EventLifecycleStatus, TicketStatus } from '@app/shared';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { TicketEventCancelledError } from '../errors/ticket-event-cancelled.error';

export class TicketEntity {
  constructor(
    readonly id: string,
    private status: TicketStatus,
    private usedAt?: Date,
  ) {}

  getStatus(): TicketStatus {
    return this.status;
  }

  getUsedAt(): Date | undefined {
    return this.usedAt;
  }

  assertCanBeShared(eventStatus: EventLifecycleStatus): void {
    if (eventStatus === 'CANCELLED') {
      throw new TicketEventCancelledError();
    }
    this.assertTicketIsAvailable();
  }

  markUsed(now: Date): void {
    this.assertTicketIsAvailable();
    if (this.status === TicketStatus.USED) {
      throw new DomainException('Ingresso já utilizado', 'TICKET_USED', 409);
    }
    this.status = TicketStatus.USED;
    this.usedAt = now;
  }

  private assertTicketIsAvailable(): void {
    if (this.status === TicketStatus.EVENT_CANCELLED) {
      throw new TicketEventCancelledError();
    }
  }
}
