import { ReservationStatus } from '@app/shared';
import { ReservationExpiredError } from '../errors/reservation-expired.error';
import { ReservationNotHeldError } from '../errors/reservation-not-held.error';
import { ReservationEntity } from './reservation.entity';

describe('ReservationEntity', () => {
  const now = new Date('2026-08-11T12:00:00.000Z');

  it('confirma uma reserva HELD não expirada', () => {
    const reservation = new ReservationEntity(
      'reservation-id',
      'user-id',
      ReservationStatus.HELD,
      new Date('2026-08-11T12:10:00.000Z'),
    );

    reservation.confirm(now);

    expect(reservation.getStatus()).toBe(ReservationStatus.CONFIRMED);
  });

  it('rejeita uma reserva HELD expirada', () => {
    const reservation = new ReservationEntity(
      'reservation-id',
      'user-id',
      ReservationStatus.HELD,
      new Date('2026-08-11T11:59:59.000Z'),
    );

    expect(() => reservation.confirm(now)).toThrow(ReservationExpiredError);
  });

  it('rejeita a confirmação de uma reserva que não está HELD', () => {
    const reservation = new ReservationEntity(
      'reservation-id',
      'user-id',
      ReservationStatus.CONFIRMED,
      new Date('2026-08-11T12:10:00.000Z'),
    );

    expect(() => reservation.confirm(now)).toThrow(ReservationNotHeldError);
  });
});
