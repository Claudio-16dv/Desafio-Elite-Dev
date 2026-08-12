import { OrderResponse } from '@app/shared';
import { QrSigner } from '../tickets/providers/qr-signer';
import { OrderRecord } from './repositories/orders.repository';

export function toOrderResponse(order: OrderRecord, qrSigner: QrSigner): OrderResponse {
  return {
    id: order.id,
    status: order.status,
    totalCents: order.totalCents,
    tickets: order.tickets.map((ticket) => ({
      id: ticket.id,
      eventId: ticket.eventId,
      eventTitle: ticket.eventTitle,
      seatLabel: ticket.seatLabel,
      status: ticket.status,
      code: ticket.code,
      qrToken: qrSigner.sign(ticket.id),
      startsAt: ticket.startsAt.toISOString(),
      venue: ticket.venue,
    })),
  };
}
