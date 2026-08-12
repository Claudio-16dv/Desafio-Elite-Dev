import { SharedTicketResponse, TicketResponse } from '@app/shared';
import { QrSigner } from './providers/qr-signer';
import { TicketRecord } from './repositories/tickets.repository';

export function toTicketResponse(ticket: TicketRecord, qrSigner: QrSigner): TicketResponse {
  return {
    id: ticket.id,
    eventId: ticket.eventId,
    eventTitle: ticket.event.title,
    seatLabel: ticket.seat.label,
    status: ticket.status,
    code: ticket.code,
    qrToken: qrSigner.sign(ticket.id),
    startsAt: ticket.event.startsAt.toISOString(),
    venue: ticket.event.venue,
  };
}

export function toSharedTicketResponse(ticket: TicketRecord, qrSigner: QrSigner): SharedTicketResponse {
  return toTicketResponse(ticket, qrSigner);
}
