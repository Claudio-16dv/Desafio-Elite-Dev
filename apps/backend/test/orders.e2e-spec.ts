import { randomUUID } from 'node:crypto';
import {
  EventStatus,
  OrderStatus as PrismaOrderStatus,
  PrismaClient,
  ReservationStatus as PrismaReservationStatus,
  Role,
} from '@prisma/client';
import { OrderStatus } from '@app/shared';
import { PrismaService } from '../src/database/prisma/prisma.service';
import { PrismaOrdersRepository } from '../src/modules/orders/repositories/prisma-orders.repository';

const FIXED_NOW = new Date('2026-08-11T12:00:00.000Z');
const FUTURE_EXPIRATION = new Date('2099-01-01T00:00:00.000Z');
const EXPIRED_AT = new Date('2020-01-01T00:00:00.000Z');

const prisma = new PrismaClient();
const repository = new PrismaOrdersRepository(prisma as unknown as PrismaService);

let userId: string | undefined;
let eventId: string | undefined;
let reservationId: string | undefined;
let seatIds: string[] = [];

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
  reservationId = undefined;
  seatIds = [];
}

async function createFixture(): Promise<void> {
  const user = await prisma.user.create({
    data: {
      name: 'Order Test User',
      email: `order-${randomUUID()}@test.local`,
      passwordHash: 'test-password-hash',
      role: Role.CLIENT,
    },
  });
  userId = user.id;

  const event = await prisma.event.create({
    data: {
      title: 'Order Integration Event',
      venue: 'Integration Venue',
      startsAt: new Date('2026-08-20T20:00:00.000Z'),
      priceCents: 2500,
      rows: 1,
      columns: 2,
      capacity: 2,
      status: EventStatus.PUBLISHED,
      organizerId: user.id,
    },
  });
  eventId = event.id;

  const firstSeat = await prisma.seat.create({
    data: {
      eventId: event.id,
      label: 'A1',
      rowLabel: 'A',
      column: 1,
    },
  });
  const secondSeat = await prisma.seat.create({
    data: {
      eventId: event.id,
      label: 'A2',
      rowLabel: 'A',
      column: 2,
    },
  });
  seatIds = [firstSeat.id, secondSeat.id];

  const reservation = await prisma.reservation.create({
    data: {
      eventId: event.id,
      userId: user.id,
      status: PrismaReservationStatus.HELD,
      expiresAt: FUTURE_EXPIRATION,
    },
  });
  reservationId = reservation.id;

  await prisma.reservationSeat.createMany({
    data: seatIds.map((seatId) => ({
      reservationId: reservation.id,
      seatId,
      eventId: event.id,
    })),
  });
}

describe('PrismaOrdersRepository (e2e)', () => {
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

  it('mantém a reserva HELD no pending e confirma com emissão idempotente', async () => {
    const order = await repository.createPendingOrder({
      reservationId: reservationId!,
      eventId: eventId!,
      userId: userId!,
      totalCents: 5000,
      now: FIXED_NOW,
    });
    const paymentIntentId = `pi-${randomUUID()}`;
    await repository.attachPaymentIntent(order.id, paymentIntentId);

    const pending = await prisma.order.findUnique({
      where: { id: order.id },
      select: { status: true },
    });
    const heldReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { status: true },
    });
    expect(pending?.status).toBe(PrismaOrderStatus.PENDING);
    expect(heldReservation?.status).toBe(PrismaReservationStatus.HELD);

    const paid = await repository.confirmPaidAndIssueTickets(paymentIntentId, FIXED_NOW);

    expect(paid.status).toBe(OrderStatus.PAID);
    expect(paid.tickets).toHaveLength(2);

    const confirmedReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { status: true },
    });
    const ticketCountAfterFirstConfirmation = await prisma.ticket.count({
      where: { orderId: order.id },
    });
    expect(confirmedReservation?.status).toBe(PrismaReservationStatus.CONFIRMED);
    expect(ticketCountAfterFirstConfirmation).toBe(2);

    const repeated = await repository.confirmPaidAndIssueTickets(paymentIntentId, FIXED_NOW);

    expect(repeated.status).toBe(OrderStatus.PAID);
    expect(repeated.tickets).toHaveLength(2);
    await expect(prisma.ticket.count({ where: { orderId: order.id } })).resolves.toBe(
      ticketCountAfterFirstConfirmation,
    );
  });

  it('expira o pedido sem emitir ingressos quando a reserva vence', async () => {
    const order = await repository.createPendingOrder({
      reservationId: reservationId!,
      eventId: eventId!,
      userId: userId!,
      totalCents: 5000,
      now: FIXED_NOW,
    });
    const paymentIntentId = `pi-${randomUUID()}`;
    await repository.attachPaymentIntent(order.id, paymentIntentId);
    await prisma.reservation.update({
      where: { id: reservationId },
      data: { expiresAt: EXPIRED_AT },
    });

    const expired = await repository.confirmPaidAndIssueTickets(paymentIntentId, FIXED_NOW);

    expect(expired.status).toBe(OrderStatus.EXPIRED);
    expect(expired.tickets).toHaveLength(0);

    const storedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      select: { status: true },
    });
    const storedReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: { status: true },
    });
    const ticketCount = await prisma.ticket.count({ where: { orderId: order.id } });
    expect(storedOrder?.status).toBe(PrismaOrderStatus.EXPIRED);
    expect(storedReservation?.status).toBe(PrismaReservationStatus.EXPIRED);
    expect(ticketCount).toBe(0);
  });
});
