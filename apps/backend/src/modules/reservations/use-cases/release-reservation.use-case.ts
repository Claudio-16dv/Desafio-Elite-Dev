import { Injectable } from '@nestjs/common';
import { ReservationResponse } from '@app/shared';
import { ReservationEntity } from '../entities/reservation.entity';
import { ReservationForbiddenError } from '../errors/reservation-forbidden.error';
import { ReservationNotFoundError } from '../errors/reservation-not-found.error';
import { toReservationResponse } from '../reservation-response.mapper';
import { ReservationsRepository } from '../repositories/reservations.repository';

@Injectable()
export class ReleaseReservationUseCase {
  constructor(private readonly reservations: ReservationsRepository) {}

  async execute(id: string, userId: string): Promise<ReservationResponse> {
    const reservation = await this.reservations.findById(id);
    if (!reservation) {
      throw new ReservationNotFoundError();
    }
    if (reservation.userId !== userId) {
      throw new ReservationForbiddenError();
    }

    const entity = new ReservationEntity(
      reservation.id,
      reservation.userId,
      reservation.status,
      reservation.expiresAt,
    );
    entity.release();

    const released = await this.reservations.release(id);
    return toReservationResponse(released);
  }
}
