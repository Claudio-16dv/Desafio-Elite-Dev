'use server';

import type { ValidationResultResponse } from '@app/shared';
import { api } from '@/shared/api';
import { validateTicketSchema } from './schema';

export async function validateTicket(input: unknown): Promise<ValidationResultResponse> {
  const data = validateTicketSchema.parse(input);
  return api.post<ValidationResultResponse>('/gate/validate', data);
}
