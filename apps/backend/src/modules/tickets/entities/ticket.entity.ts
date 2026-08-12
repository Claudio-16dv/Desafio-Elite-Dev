import { TicketStatus } from '@app/shared';
import { DomainException } from '../../../common/exceptions/domain.exception';

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

  markUsed(now: Date): void {
    if (this.status === TicketStatus.USED) {
      throw new DomainException('Ingresso já utilizado', 'TICKET_USED', 409);
    }
    this.status = TicketStatus.USED;
    this.usedAt = now;
  }
}
