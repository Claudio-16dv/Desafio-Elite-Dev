import { Injectable } from '@nestjs/common';
import {
  TicketStatus,
  ValidateTicketRequest,
  ValidationOutcome,
  ValidationResultResponse,
} from '@app/shared';
import { QrSigner } from '../../tickets/providers/qr-signer';
import { TicketsRepository } from '../../tickets/repositories/tickets.repository';

@Injectable()
export class ValidateTicketUseCase {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly qrSigner: QrSigner,
  ) {}

  async execute(input: ValidateTicketRequest): Promise<ValidationResultResponse> {
    const ticketId = await this.resolveTicketId(input);
    if (!ticketId) {
      return { outcome: ValidationOutcome.INVALID };
    }

    const ticket = await this.tickets.findById(ticketId);
    if (!ticket) {
      return { outcome: ValidationOutcome.INVALID };
    }
    if (ticket.eventId !== input.eventId) {
      return { outcome: ValidationOutcome.WRONG_EVENT };
    }
    if (ticket.status === TicketStatus.EVENT_CANCELLED || ticket.event.status !== 'PUBLISHED') {
      return { outcome: ValidationOutcome.INVALID };
    }

    const updated = await this.tickets.markUsedIfValid(ticketId, new Date());
    if (!updated) {
      const current = await this.tickets.findById(ticketId);
      if (
        !current ||
        current.status === TicketStatus.EVENT_CANCELLED ||
        current.event.status !== 'PUBLISHED'
      ) {
        return { outcome: ValidationOutcome.INVALID };
      }
      return { outcome: ValidationOutcome.ALREADY_USED };
    }

    return {
      outcome: ValidationOutcome.VALID,
      ticketId: ticket.id,
      seatLabel: ticket.seat.label,
    };
  }

  private async resolveTicketId(input: ValidateTicketRequest): Promise<string | null> {
    if (input.token) {
      return this.qrSigner.verify(input.token);
    }
    if (input.code) {
      const ticket = await this.tickets.findByCode(input.code);
      return ticket?.id ?? null;
    }
    return null;
  }
}
