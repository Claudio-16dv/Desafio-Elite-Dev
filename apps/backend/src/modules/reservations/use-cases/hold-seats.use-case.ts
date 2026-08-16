import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateReservationRequest, ReservationResponse } from '@app/shared';
import { toReservationResponse } from '../reservation-response.mapper';
import { ReservationsRepository } from '../repositories/reservations.repository';

@Injectable()
export class HoldSeatsUseCase {
  constructor(
    private readonly reservations: ReservationsRepository,
    private readonly config: ConfigService,
  ) {}

  async execute(userId: string, input: CreateReservationRequest): Promise<ReservationResponse> {
    const ttlMinutes = this.config.get<number>('app.reservationTtlMinutes') ?? 5;
    const reservation = await this.reservations.holdSeats({
      eventId: input.eventId,
      userId,
      seatIds: input.seatIds,
      ttlMinutes,
    });
    return toReservationResponse(reservation);
  }
}
