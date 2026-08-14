import 'server-only';

import type { SharedTicketResponse, TicketResponse } from '@app/shared';
import { ApiError, api } from '@/shared/api';

export async function listMyTickets(): Promise<TicketResponse[]> {
  return api.get<TicketResponse[]>('/tickets/mine');
}

export async function getTicketById(id: string): Promise<TicketResponse | null> {
  try {
    return await api.get<TicketResponse>(`/tickets/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getSharedTicket(shareToken: string): Promise<SharedTicketResponse | null> {
  try {
    return await api.get<SharedTicketResponse>(`/tickets/shared/${shareToken}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
