import { z } from 'zod';

export const shareTicketSchema = z.object({
  ticketId: z.string().uuid('Ingresso inválido.'),
});
