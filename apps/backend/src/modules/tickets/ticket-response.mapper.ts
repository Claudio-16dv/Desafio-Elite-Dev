import { SharedTicketResponse, TicketResponse, TicketStatus } from '@app/shared';
import { QrSigner } from './providers/qr-signer';
import { TicketRecord } from './repositories/tickets.repository';

export function toTicketResponse(ticket: TicketRecord, qrSigner: QrSigner): TicketResponse {
  const eventCancelled =
    ticket.status === TicketStatus.EVENT_CANCELLED || ticket.event.status === 'CANCELLED';

  return {
    id: ticket.id,
    eventId: ticket.eventId,
    eventTitle: ticket.event.title,
    seatLabel: ticket.seat.label,
    status: eventCancelled ? TicketStatus.EVENT_CANCELLED : ticket.status,
    ...(eventCancelled
      ? {}
      : {
          code: ticket.code,
          qrToken: qrSigner.sign(ticket.id),
        }),
    startsAt: ticket.event.startsAt.toISOString(),
    venue: ticket.event.venue,
  };
}

export function toSharedTicketResponse(
  ticket: TicketRecord,
  qrSigner: QrSigner,
): SharedTicketResponse {
  return toTicketResponse(ticket, qrSigner);
}
