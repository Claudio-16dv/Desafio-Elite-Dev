import 'server-only';

import type { OrderResponse } from '@app/shared';
import { api } from '@/shared/api';
import { getEventById, getSeats } from '@/features/events/queries';

export async function getEventForCheckout(eventId: string) {
  const [event, seats] = await Promise.all([getEventById(eventId), getSeats(eventId)]);

  if (!event) {
    return null;
  }

  return { event, seats };
}

export async function getOrderStatus(orderId: string): Promise<OrderResponse> {
  return api.get<OrderResponse>(`/orders/${orderId}`);
}
