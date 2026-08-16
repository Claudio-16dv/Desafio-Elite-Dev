import { randomUUID } from 'node:crypto';
import {
  EventStatus,
  PrismaClient,
  ReservationStatus as PrismaReservationStatus,
  Role,
} from '@prisma/client';
import { ReservationStatus } from '@app/shared';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { SeatAlreadyTakenError } from '../src/modules/reservations/errors/seat-already-taken.error';
import { PrismaReservationsRepository } from '../src/modules/reservations/repositories/prisma-reservations.repository';

const prisma = new PrismaClient();
const repository = new PrismaReservationsRepository(prisma as unknown as PrismaService);

let userId: string | undefined;
let eventId: string | undefined;
let seatId: string | undefined;

async function cleanFixture(): Promise<void> {
  if (eventId) {
    await prisma.reservationSeat.deleteMany({ where: { eventId } });
    await prisma.reservation.deleteMany({ where: { eventId } });
    await prisma.seat.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { id: eventId } });
  }
  if (userId) {
    await prisma.user.deleteMany({ where: { id: userId } });
  }
  userId = undefined;
  eventId = undefined;
  seatId = undefined;
}

async function createFixture(): Promise<void> {
  const user = await prisma.user.create({
    data: {
      name: 'Reservation Test User',
      email: `reservation-${randomUUID()}@test.local`,
      passwordHash: 'test-password-hash',
      role: Role.CLIENT,
    },
  });
  userId = user.id;

  const event = await prisma.event.create({
    data: {
      title: 'Reservation Integration Event',
      venue: 'Integration Venue',
      startsAt: new Date('2026-08-20T20:00:00.000Z'),
      priceCents: 2500,
      rows: 1,
      columns: 1,
      capacity: 1,
      status: EventStatus.PUBLISHED,
      organizerId: user.id,
    },
  });
  eventId = event.id;

  const seat = await prisma.seat.create({
    data: {
      eventId: event.id,
      label: 'A1',
      rowLabel: 'A',
      column: 1,
    },
  });
  seatId = seat.id;
}

describe('PrismaReservationsRepository (e2e)', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await createFixture();
  });

  afterEach(async () => {
    await cleanFixture();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('permite somente um hold concorrente para o mesmo assento', async () => {
    const input = {
      eventId: eventId!,
      userId: userId!,
      seatIds: [seatId!],
      ttlMinutes: 5,
    };

    const results = await Promise.allSettled([
      repository.holdSeats(input),
      repository.holdSeats(input),
    ]);

    const successful = results.filter((result) => result.status === 'fulfilled');
    const failed = results.filter((result) => result.status === 'rejected');

    expect(successful).toHaveLength(1);
    expect(failed).toHaveLength(1);
    expect(failed[0]).toMatchObject({
      status: 'rejected',
      reason: expect.any(SeatAlreadyTakenError),
    });

    const allocations = await prisma.reservationSeat.findMany({ where: { eventId } });
    expect(allocations).toHaveLength(1);
  });

  it('libera um hold expirado antes de criar um novo hold do assento', async () => {
    const expiredReservation = await prisma.reservation.create({
      data: {
        eventId: eventId!,
        userId: userId!,
        status: PrismaReservationStatus.HELD,
        expiresAt: new Date('2020-01-01T00:00:00.000Z'),
      },
    });
    await prisma.reservationSeat.create({
      data: {
        reservationId: expiredReservation.id,
        seatId: seatId!,
        eventId: eventId!,
      },
    });

    const created = await repository.holdSeats({
      eventId: eventId!,
      userId: userId!,
      seatIds: [seatId!],
      ttlMinutes: 5,
    });

    expect(created.status).toBe(ReservationStatus.HELD);
    expect(created.seats).toEqual([{ id: seatId, label: 'A1' }]);

    const expired = await prisma.reservation.findUnique({
      where: { id: expiredReservation.id },
      select: { status: true },
    });
    expect(expired?.status).toBe(PrismaReservationStatus.EXPIRED);

    const allocations = await prisma.reservationSeat.findMany({ where: { eventId } });
    expect(allocations).toEqual([
      expect.objectContaining({
        reservationId: created.id,
        seatId,
        eventId,
      }),
    ]);
  });
});
