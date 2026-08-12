import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { PrismaReservationsRepository } from './repositories/prisma-reservations.repository';
import { ReservationsRepository } from './repositories/reservations.repository';
import { GetReservationUseCase } from './use-cases/get-reservation.use-case';
import { HoldSeatsUseCase } from './use-cases/hold-seats.use-case';
import { ReleaseReservationUseCase } from './use-cases/release-reservation.use-case';

@Module({
  controllers: [ReservationsController],
  providers: [
    HoldSeatsUseCase,
    ReleaseReservationUseCase,
    GetReservationUseCase,
    { provide: ReservationsRepository, useClass: PrismaReservationsRepository },
  ],
  exports: [ReservationsRepository],
})
export class ReservationsModule {}
