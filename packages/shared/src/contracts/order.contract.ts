import { OrderStatus } from '../enums/order-status';
import { TicketResponse } from './ticket.contract';

export interface CheckoutRequest {
  reservationId: string;
  simulateOutcome?: 'approve' | 'refuse';
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
  totalCents: number;
  tickets: TicketResponse[];
}

export interface OrderListItem {
  id: string;
  eventId: string;
  eventTitle: string;
  seatLabels: string[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
  canCancel: boolean;
}
