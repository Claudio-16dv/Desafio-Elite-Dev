import { Injectable } from '@nestjs/common';
import { ReservationResponse } from '@app/shared';
import { ReservationForbiddenError } from '../errors/reservation-forbidden.error';
import { ReservationNotFoundError } from '../errors/reservation-not-found.error';
import { toReservationResponse } from '../reservation-response.mapper';
import { ReservationsRepository } from '../repositories/reservations.repository';

@Injectable()
export class GetReservationUseCase {
  constructor(private readonly reservations: ReservationsRepository) {}

  async execute(id: string, userId: string): Promise<ReservationResponse> {
    const reservation = await this.reservations.findById(id);
    if (!reservation) {
      throw new ReservationNotFoundError();
    }
    if (reservation.userId !== userId) {
      throw new ReservationForbiddenError();
    }
    return toReservationResponse(reservation);
  }
}
