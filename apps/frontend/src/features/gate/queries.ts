import 'server-only';

import type { EventSummary } from '@app/shared';
import { api } from '@/shared/api';

export async function listGateEvents(): Promise<EventSummary[]> {
  return api.get<EventSummary[]>('/gate/events');
}
