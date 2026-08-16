import { OrderStatus, TicketStatus } from '@app/shared';

export interface OrderTicketRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  seatLabel: string;
  status: TicketStatus;
  code: string;
  startsAt: Date;
  venue: string;
}

export interface OrderRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  reservationId: string;
  status: OrderStatus;
  totalCents: number;
  createdAt: Date;
  seatLabels: string[];
  tickets: OrderTicketRecord[];
}

export interface CreatePendingOrderInput {
  reservationId: string;
  eventId: string;
  userId: string;
  totalCents: number;
  now: Date;
}

export abstract class OrdersRepository {
  abstract createPendingOrder(input: CreatePendingOrderInput): Promise<OrderRecord>;
  abstract deletePendingOrder(id: string): Promise<void>;
  abstract attachPaymentIntent(orderId: string, paymentIntentId: string): Promise<OrderRecord>;
  abstract findByPaymentIntentId(paymentIntentId: string): Promise<OrderRecord | null>;
  abstract confirmPaidAndIssueTickets(paymentIntentId: string, now: Date): Promise<OrderRecord>;
  abstract expireOrder(id: string): Promise<OrderRecord>;
  abstract releasePendingByReservation(reservationId: string): Promise<void>;
  abstract findById(id: string): Promise<OrderRecord | null>;
  abstract findByUserId(userId: string): Promise<OrderRecord[]>;
  abstract cancel(id: string): Promise<OrderRecord>;
}
