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
