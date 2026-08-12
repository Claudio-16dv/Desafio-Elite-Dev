import { Injectable } from '@nestjs/common';
import { TicketResponse } from '@app/shared';
import { TicketForbiddenError } from '../errors/ticket-forbidden.error';
import { TicketNotFoundError } from '../errors/ticket-not-found.error';
import { QrSigner } from '../providers/qr-signer';
import { TicketsRepository } from '../repositories/tickets.repository';
import { toTicketResponse } from '../ticket-response.mapper';

@Injectable()
export class GetTicketUseCase {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly qrSigner: QrSigner,
  ) {}

  async execute(id: string, userId: string): Promise<TicketResponse> {
    const ticket = await this.tickets.findById(id);
    if (!ticket) {
      throw new TicketNotFoundError();
    }
    if (ticket.userId !== userId) {
      throw new TicketForbiddenError();
    }
    return toTicketResponse(ticket, this.qrSigner);
  }
}
