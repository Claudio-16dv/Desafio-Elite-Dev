import { ReservationResponse } from '@app/shared';
import { ReservationRecord } from './repositories/reservations.repository';

export function toReservationResponse(reservation: ReservationRecord): ReservationResponse {
  return {
    id: reservation.id,
    eventId: reservation.eventId,
    status: reservation.status,
    expiresAt: reservation.expiresAt.toISOString(),
    seatLabels: reservation.seats.map((seat) => seat.label),
  };
}
