import { randomUUID } from 'node:crypto';
import {
  EventStatus,
  OrderStatus as PrismaOrderStatus,
  PrismaClient,
  ReservationStatus as PrismaReservationStatus,
  Role,
  TicketStatus as PrismaTicketStatus,
} from '@prisma/client';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { PrismaTicketsRepository } from '../src/modules/tickets/repositories/prisma-tickets.repository';

const FIXED_NOW = new Date('2026-08-11T12:00:00.000Z');

const prisma = new PrismaClient();
const repository = new PrismaTicketsRepository(prisma as unknown as PrismaService);

let userId: string | undefined;
let eventId: string | undefined;
let seatId: string | undefined;
let reservationId: string | undefined;
let orderId: string | undefined;
let ticketId: string | undefined;

async function cleanFixture(): Promise<void> {
  if (eventId) {
    await prisma.ticket.deleteMany({ where: { eventId } });
    await prisma.order.deleteMany({ where: { eventId } });
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
  reservationId = undefined;
  orderId = undefined;
  ticketId = undefined;
}

async function createFixture(): Promise<void> {
  const user = await prisma.user.create({
    data: {
      name: 'Gate Test User',
      email: `gate-${randomUUID()}@test.local`,
      passwordHash: 'test-password-hash',
      role: Role.CLIENT,
    },
  });
  userId = user.id;

  const event = await prisma.event.create({
    data: {
      title: 'Gate Integration Event',
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

  const reservation = await prisma.reservation.create({
    data: {
      eventId: event.id,
      userId: user.id,
      status: PrismaReservationStatus.CONFIRMED,
      expiresAt: new Date('2099-01-01T00:00:00.000Z'),
    },
  });
  reservationId = reservation.id;

  const order = await prisma.order.create({
    data: {
      eventId: event.id,
      userId: user.id,
      reservationId: reservation.id,
      stripePaymentIntentId: `pi-${randomUUID()}`,
      status: PrismaOrderStatus.PAID,
      totalCents: 2500,
    },
  });
  orderId = order.id;

  const ticket = await prisma.ticket.create({
    data: {
      orderId: order.id,
      eventId: event.id,
      userId: user.id,
      seatId: seat.id,
      status: PrismaTicketStatus.VALID,
      code: `GATE-${randomUUID()}`,
    },
  });
  ticketId = ticket.id;
}

describe('PrismaTicketsRepository (e2e)', () => {
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

  it('marca o ingresso uma vez e rejeita a segunda marcação', async () => {
    await expect(repository.markUsedIfValid(ticketId!, FIXED_NOW)).resolves.toBe(1);
    await expect(repository.markUsedIfValid(ticketId!, FIXED_NOW)).resolves.toBe(0);

    const storedTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { status: true, usedAt: true },
    });
    expect(storedTicket?.status).toBe(PrismaTicketStatus.USED);
    expect(storedTicket?.usedAt).toEqual(FIXED_NOW);
  });
});
