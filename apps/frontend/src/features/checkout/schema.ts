import { z } from 'zod';

export const holdSeatsSchema = z.object({
  eventId: z.string().uuid('Evento inválido.'),
  seatIds: z
    .array(z.string().uuid('Assento inválido.'))
    .min(1, 'Selecione pelo menos um assento.')
    .max(10, 'Escolha no máximo 10 assentos por reserva.'),
});

export const checkoutSchema = z.object({
  reservationId: z.string().uuid('Reserva inválida.'),
  simulateOutcome: z.enum(['approve', 'refuse']),
});

export const releaseReservationSchema = z.object({
  reservationId: z.string().uuid('Reserva inválida.'),
});

export type HoldSeatsInput = z.infer<typeof holdSeatsSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
