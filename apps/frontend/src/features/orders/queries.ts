import 'server-only';

import type { OrderListItem } from '@app/shared';
import { api } from '@/shared/api';

export async function listMyOrders(): Promise<OrderListItem[]> {
  return api.get<OrderListItem[]>('/orders/mine');
}
