import { OrderListItem, OrderResponse, OrderStatus, TicketStatus } from '@app/shared';
import { QrSigner } from '../tickets/providers/qr-signer';
import { OrderRecord } from './repositories/orders.repository';

export function toOrderListItem(order: OrderRecord): OrderListItem {
  return {
    id: order.id,
    eventId: order.eventId,
    eventTitle: order.eventTitle,
    seatLabels: order.seatLabels,
    totalCents: order.totalCents,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    canCancel: order.status === OrderStatus.PAID,
  };
}

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
      ...(ticket.status === TicketStatus.EVENT_CANCELLED
        ? {}
        : {
            code: ticket.code,
            qrToken: qrSigner.sign(ticket.id),
          }),
      startsAt: ticket.startsAt.toISOString(),
      venue: ticket.venue,
    })),
  };
}
