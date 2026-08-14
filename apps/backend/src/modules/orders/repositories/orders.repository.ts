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

export interface TicketToCreate {
  seatId: string;
  code: string;
}

export interface CreatePaidOrderInput {
  reservationId: string;
  eventId: string;
  userId: string;
  totalCents: number;
  tickets: TicketToCreate[];
  now: Date;
}

export interface CreateRefusedOrderInput {
  reservationId: string;
  eventId: string;
  userId: string;
  totalCents: number;
  now: Date;
}

export abstract class OrdersRepository {
  abstract createPaidOrderWithTickets(input: CreatePaidOrderInput): Promise<OrderRecord>;
  abstract createRefusedOrderAndRelease(input: CreateRefusedOrderInput): Promise<OrderRecord>;
  abstract findById(id: string): Promise<OrderRecord | null>;
  abstract findByUserId(userId: string): Promise<OrderRecord[]>;
  abstract cancel(id: string): Promise<OrderRecord>;
}
