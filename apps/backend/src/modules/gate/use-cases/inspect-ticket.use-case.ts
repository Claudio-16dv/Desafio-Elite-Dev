import { Injectable } from '@nestjs/common';
import {
  TicketInspectionResponse,
  TicketStatus,
  ValidateTicketRequest,
  ValidationOutcome,
} from '@app/shared';
import { QrSigner } from '../../tickets/providers/qr-signer';
import { TicketsRepository } from '../../tickets/repositories/tickets.repository';
import { resolveTicketId } from './resolve-ticket-id';

@Injectable()
export class InspectTicketUseCase {
  constructor(
    private readonly tickets: TicketsRepository,
    private readonly qrSigner: QrSigner,
  ) {}

  async execute(
    input: ValidateTicketRequest,
    gateOrganizerId: string | null,
  ): Promise<TicketInspectionResponse> {
    const ticketId = await resolveTicketId(input, this.tickets, this.qrSigner);
    if (!ticketId) {
      return { outcome: ValidationOutcome.INVALID };
    }

    const ticket = await this.tickets.findById(ticketId);
    if (!ticket || ticket.event.organizerId !== gateOrganizerId) {
      return { outcome: ValidationOutcome.INVALID };
    }
    if (ticket.eventId !== input.eventId) {
      return { outcome: ValidationOutcome.WRONG_EVENT };
    }
    if (ticket.status === TicketStatus.USED) {
      return {
        outcome: ValidationOutcome.ALREADY_USED,
        eventTitle: ticket.event.title,
        seatLabel: ticket.seat.label,
      };
    }
    if (ticket.status === TicketStatus.EVENT_CANCELLED || ticket.event.status !== 'PUBLISHED') {
      return { outcome: ValidationOutcome.INVALID };
    }

    return {
      outcome: ValidationOutcome.VALID,
      ticketId: ticket.id,
      eventTitle: ticket.event.title,
      seatLabel: ticket.seat.label,
    };
  }
}
