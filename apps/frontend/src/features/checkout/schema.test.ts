import { describe, expect, it } from 'vitest';
import { MAX_SEATS_PER_RESERVATION } from './constants';
import { checkoutSchema, holdSeatsSchema } from './schema';

const EVENT_ID = '00000000-0000-4000-8000-000000000001';
const RESERVATION_ID = '00000000-0000-4000-8000-000000000002';

function seatId(index: number) {
  return `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

describe('checkout schemas', () => {
  it('rejeita mais de dez assentos', () => {
    const result = holdSeatsSchema.safeParse({
      eventId: EVENT_ID,
      seatIds: Array.from({ length: MAX_SEATS_PER_RESERVATION + 1 }, (_, index) =>
        seatId(index + 1),
      ),
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    expect(result.error.issues[0]).toMatchObject({
      path: ['seatIds'],
      message: 'Escolha no máximo 10 assentos por reserva.',
    });
  });

  it('aceita de um a dez assentos', () => {
    expect(
      holdSeatsSchema.safeParse({
        eventId: EVENT_ID,
        seatIds: [seatId(1)],
      }).success,
    ).toBe(true);
    expect(
      holdSeatsSchema.safeParse({
        eventId: EVENT_ID,
        seatIds: Array.from({ length: MAX_SEATS_PER_RESERVATION }, (_, index) => seatId(index + 1)),
      }).success,
    ).toBe(true);
  });

  it('rejeita lista vazia e eventId inválido', () => {
    const emptySeats = holdSeatsSchema.safeParse({ eventId: EVENT_ID, seatIds: [] });
    expect(emptySeats.success).toBe(false);
    if (!emptySeats.success) {
      expect(emptySeats.error.issues[0]).toMatchObject({
        path: ['seatIds'],
        message: 'Selecione pelo menos um assento.',
      });
    }

    const invalidEvent = holdSeatsSchema.safeParse({
      eventId: 'not-an-uuid',
      seatIds: [seatId(1)],
    });
    expect(invalidEvent.success).toBe(false);
    if (!invalidEvent.success) {
      expect(invalidEvent.error.issues[0]).toMatchObject({
        path: ['eventId'],
        message: 'Evento inválido.',
      });
    }
  });

  it('valida reservationId no checkout', () => {
    const invalid = checkoutSchema.safeParse({ reservationId: 'not-an-uuid' });
    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.issues[0]).toMatchObject({
        path: ['reservationId'],
        message: 'Reserva inválida.',
      });
    }

    expect(checkoutSchema.safeParse({ reservationId: RESERVATION_ID }).success).toBe(true);
  });
});
