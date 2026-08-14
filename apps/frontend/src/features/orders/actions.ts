'use server';

import type { OrderResponse } from '@app/shared';
import { api } from '@/shared/api';
import { cancelOrderSchema } from './schema';

export async function cancelOrder(input: unknown): Promise<OrderResponse> {
  const { orderId } = cancelOrderSchema.parse(input);
  return api.post<OrderResponse>('/orders/' + orderId + '/cancel');
}
