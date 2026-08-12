import { Injectable } from '@nestjs/common';
import { TicketResponse } from '@app/shared';
import { QrSigner } from '../providers/qr-signer';
import { TicketsRepository } from '../repositories/tickets.repository';
import { toTicketResponse } from '../ticket-response.mapper';

@Injectable()
export class ListMyTicketsUseCase {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly qrSigner: QrSigner,
  ) {}

  async execute(userId: string): Promise<TicketResponse[]> {
    const tickets = await this.tickets.findByUserId(userId);
    return tickets.map((ticket) => toTicketResponse(ticket, this.qrSigner));
  }
}
