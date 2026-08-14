'use server';

import type { ShareLinkResponse } from '@app/shared';
import { api } from '@/shared/api';
import { shareTicketSchema } from './schema';

export async function createShareLink(input: unknown): Promise<ShareLinkResponse> {
  const { ticketId } = shareTicketSchema.parse(input);
  return api.post<ShareLinkResponse>(`/tickets/${ticketId}/share`);
}
