import { Injectable } from '@nestjs/common';
import { EventStatus, Prisma, ReservationStatus as PrismaReservationStatus } from '@prisma/client';
import { ReservationStatus } from '@app/shared';
import { isPrismaP2002 } from '../../../common/prisma-errors';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { EventNotPublishedError } from '../errors/event-not-published.error';
import { ReservationNotFoundError } from '../errors/reservation-not-found.error';
import { SeatAlreadyTakenError } from '../errors/seat-already-taken.error';
import {
  HoldSeatsInput,
  ReservationRecord,
  ReservationsRepository,
} from './reservations.repository';

type ReservationWithDetails = Prisma.ReservationGetPayload<{
  include: {
    event: {
      select: {
        id: true;
        title: true;
        priceCents: true;
        startsAt: true;
        venue: true;
        status: true;
      };
    };
    seats: {
      include: {
        seat: {
          select: {
            id: true;
            label: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class PrismaReservationsRepository extends ReservationsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async holdSeats(input: HoldSeatsInput): Promise<ReservationRecord> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + input.ttlMinutes * 60_000);

    return this.prisma.$transaction(async (tx) => {
      const [event] = await tx.$queryRaw<Array<{ status: EventStatus }>>(
        Prisma.sql`SELECT "status" FROM "Event" WHERE "id" = ${input.eventId} FOR SHARE`,
      );
      if (!event) {
        throw new DomainException('Evento não encontrado', 'EVENT_NOT_FOUND', 404);
      }
      if (event.status !== EventStatus.PUBLISHED) {
        throw new EventNotPublishedError();
      }

      const requestedSeatIds = [...new Set(input.seatIds)];
      if (requestedSeatIds.length !== input.seatIds.length) {
        throw new SeatAlreadyTakenError();
      }

      const validSeats = await tx.seat.count({
        where: { eventId: input.eventId, id: { in: requestedSeatIds } },
      });
      if (validSeats !== requestedSeatIds.length) {
        throw new DomainException('Assento não encontrado para este evento', 'SEAT_NOT_FOUND', 404);
      }

      const expiredReservations = await tx.reservation.findMany({
        where: {
          eventId: input.eventId,
          status: PrismaReservationStatus.HELD,
          expiresAt: { lte: now },
        },
        select: { id: true },
      });

      if (expiredReservations.length) {
        const expiredIds = expiredReservations.map((reservation) => reservation.id);
        await tx.reservationSeat.deleteMany({ where: { reservationId: { in: expiredIds } } });
        await tx.reservation.updateMany({
          where: { id: { in: expiredIds } },
          data: { status: PrismaReservationStatus.EXPIRED },
        });
      }

      const reservation = await tx.reservation.create({
        data: {
          eventId: input.eventId,
          userId: input.userId,
          status: PrismaReservationStatus.HELD,
          expiresAt,
        },
      });

      try {
        await tx.reservationSeat.createMany({
          data: requestedSeatIds.map((seatId) => ({
            reservationId: reservation.id,
            seatId,
            eventId: input.eventId,
          })),
        });
      } catch (error) {
        if (isPrismaP2002(error)) {
          throw new SeatAlreadyTakenError();
        }
        throw error;
      }

      const created = await this.findDetails(tx, reservation.id);
      if (!created) {
        throw new ReservationNotFoundError();
      }
      return this.toRecord(created);
    });
  }

  async findById(id: string): Promise<ReservationRecord | null> {
    const reservation = await this.findDetails(this.prisma, id);
    return reservation ? this.toRecord(reservation) : null;
  }

  async release(id: string): Promise<ReservationRecord> {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await this.findDetails(tx, id);
      if (!reservation) {
        throw new ReservationNotFoundError();
      }

      await tx.reservationSeat.deleteMany({ where: { reservationId: id } });
      await tx.reservation.update({
        where: { id },
        data: { status: PrismaReservationStatus.RELEASED },
      });

      return {
        ...this.toRecord(reservation),
        status: ReservationStatus.RELEASED,
      };
    });
  }

  private findDetails(
    client: Prisma.TransactionClient | PrismaService,
    id: string,
  ): Promise<ReservationWithDetails | null> {
    return client.reservation.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            priceCents: true,
            startsAt: true,
            venue: true,
            status: true,
          },
        },
        seats: {
          include: {
            seat: {
              select: {
                id: true,
                label: true,
              },
            },
          },
          orderBy: { seat: { label: 'asc' } },
        },
      },
    });
  }

  private toRecord(reservation: ReservationWithDetails): ReservationRecord {
    return {
      id: reservation.id,
      eventId: reservation.eventId,
      userId: reservation.userId,
      status: reservation.status as ReservationStatus,
      expiresAt: reservation.expiresAt,
      seats: reservation.seats.map(({ seat }) => ({ id: seat.id, label: seat.label })),
      event: {
        id: reservation.event.id,
        title: reservation.event.title,
        priceCents: reservation.event.priceCents,
        startsAt: reservation.event.startsAt,
        venue: reservation.event.venue,
        status: reservation.event.status,
      },
    };
  }
}
