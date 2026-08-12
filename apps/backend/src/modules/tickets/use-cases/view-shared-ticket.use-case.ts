import { Injectable } from '@nestjs/common';
import { SharedTicketResponse } from '@app/shared';
import { TicketNotFoundError } from '../errors/ticket-not-found.error';
import { QrSigner } from '../providers/qr-signer';
import { TicketsRepository } from '../repositories/tickets.repository';
import { toSharedTicketResponse } from '../ticket-response.mapper';

@Injectable()
export class ViewSharedTicketUseCase {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly qrSigner: QrSigner,
  ) {}

  async execute(shareToken: string): Promise<SharedTicketResponse> {
    const ticket = await this.tickets.findByShareToken(shareToken);
    if (!ticket) {
      throw new TicketNotFoundError();
    }
    return toSharedTicketResponse(ticket, this.qrSigner);
  }
}
