import { Injectable } from '@nestjs/common';
import {
  EventStatus,
  OrderStatus as PrismaOrderStatus,
  Prisma,
  ReservationStatus as PrismaReservationStatus,
  TicketStatus as PrismaTicketStatus,
} from '@prisma/client';
import { OrderStatus, TicketStatus } from '@app/shared';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ReservationExpiredError } from '../../reservations/errors/reservation-expired.error';
import { EventNotPublishedError } from '../../reservations/errors/event-not-published.error';
import { ReservationNotHeldError } from '../../reservations/errors/reservation-not-held.error';
import { ReservationNotFoundError } from '../../reservations/errors/reservation-not-found.error';
import { OrderEntity } from '../entities/order.entity';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import { OrderNotPaidError } from '../errors/order-not-paid.error';
import { OrderNotPendingError } from '../errors/order-not-pending.error';
import { generateTicketCode } from '../ticket-code';
import { CreatePendingOrderInput, OrderRecord, OrdersRepository } from './orders.repository';

const orderDetailsInclude = {
  event: {
    select: {
      id: true,
      title: true,
      startsAt: true,
      venue: true,
    },
  },
  reservation: {
    select: {
      seats: {
        include: {
          seat: {
            select: {
              id: true,
              label: true,
            },
          },
        },
        orderBy: {
          seat: {
            label: 'asc' as const,
          },
        },
      },
    },
  },
  tickets: {
    include: {
      seat: {
        select: {
          label: true,
        },
      },
    },
    orderBy: {
      seat: {
        label: 'asc' as const,
      },
    },
  },
} satisfies Prisma.OrderInclude;

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof orderDetailsInclude;
}>;

@Injectable()
export class PrismaOrdersRepository extends OrdersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createPendingOrder(input: CreatePendingOrderInput): Promise<OrderRecord> {
    return this.prisma.$transaction(async (tx) => {
      await this.assertEventCanBeCheckedOut(tx, input.eventId);

      const reservation = await tx.reservation.findUnique({
        where: { id: input.reservationId },
        select: { id: true, status: true, expiresAt: true },
      });
      this.assertReservationCanBeCheckedOut(reservation, input.now);

      const existingOrder = await tx.order.findUnique({
        where: { reservationId: input.reservationId },
        select: { id: true },
      });
      if (existingOrder) {
        throw new ReservationNotHeldError();
      }

      const order = await tx.order.create({
        data: {
          eventId: input.eventId,
          userId: input.userId,
          reservationId: input.reservationId,
          status: PrismaOrderStatus.PENDING,
          totalCents: input.totalCents,
        },
      });

      const created = await this.findDetails(tx, order.id);
      if (!created) {
        throw new OrderNotFoundError();
      }
      return this.toRecord(created);
    });
  }

  async deletePendingOrder(id: string): Promise<void> {
    await this.prisma.order.deleteMany({
      where: { id, status: PrismaOrderStatus.PENDING },
    });
  }

  async attachPaymentIntent(orderId: string, paymentIntentId: string): Promise<OrderRecord> {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({
        where: { id: orderId },
        select: { status: true, stripePaymentIntentId: true },
      });
      if (!current) {
        throw new OrderNotFoundError();
      }
      if (current.stripePaymentIntentId === paymentIntentId) {
        const existing = await this.findDetails(tx, orderId);
        if (!existing) {
          throw new OrderNotFoundError();
        }
        return this.toRecord(existing);
      }
      if (current.status !== PrismaOrderStatus.PENDING || current.stripePaymentIntentId) {
        throw new OrderNotPendingError();
      }

      await tx.order.update({
        where: { id: orderId },
        data: { stripePaymentIntentId: paymentIntentId },
      });

      const attached = await this.findDetails(tx, orderId);
      if (!attached) {
        throw new OrderNotFoundError();
      }
      return this.toRecord(attached);
    });
  }

  async findByPaymentIntentId(paymentIntentId: string): Promise<OrderRecord | null> {
    const order = await this.prisma.order.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
      include: orderDetailsInclude,
    });
    return order ? this.toRecord(order) : null;
  }

  async confirmPaidAndIssueTickets(paymentIntentId: string, now: Date): Promise<OrderRecord> {
    return this.prisma.$transaction(async (tx) => {
      const reference = await tx.order.findUnique({
        where: { stripePaymentIntentId: paymentIntentId },
        select: { id: true, eventId: true },
      });
      if (!reference) {
        throw new OrderNotFoundError();
      }

      const eventStatus = await this.findEventStatus(tx, reference.eventId);
      await tx.$queryRaw(Prisma.sql`
        SELECT "id"
        FROM "Order"
        WHERE "id" = ${reference.id}
        FOR UPDATE
      `);

      const order = await this.findDetails(tx, reference.id);
      if (!order) {
        throw new OrderNotFoundError();
      }
      if (order.status !== PrismaOrderStatus.PENDING) {
        return this.toRecord(order);
      }

      const reservationRows = await tx.$queryRaw<
        Array<{ status: PrismaReservationStatus; expiresAt: Date }>
      >(Prisma.sql`
        SELECT "status", "expiresAt"
        FROM "Reservation"
        WHERE "id" = ${order.reservationId}
        FOR UPDATE
      `);
      const reservation = reservationRows[0];

      if (
        eventStatus !== EventStatus.PUBLISHED ||
        !reservation ||
        reservation.status !== PrismaReservationStatus.HELD ||
        reservation.expiresAt <= now
      ) {
        const reservationStatus =
          eventStatus === EventStatus.PUBLISHED &&
          reservation?.status === PrismaReservationStatus.HELD &&
          reservation.expiresAt <= now
            ? PrismaReservationStatus.EXPIRED
            : PrismaReservationStatus.RELEASED;
        await this.expirePendingOrder(tx, order.id, order.reservationId, reservationStatus);
        const expired = await this.findDetails(tx, order.id);
        if (!expired) {
          throw new OrderNotFoundError();
        }
        return this.toRecord(expired);
      }

      const entity = new OrderEntity(order.id, order.status as OrderStatus);
      entity.markPaid();

      await tx.reservation.update({
        where: { id: order.reservationId },
        data: { status: PrismaReservationStatus.CONFIRMED },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: PrismaOrderStatus.PAID },
      });

      if (order.reservation.seats.length) {
        await tx.ticket.createMany({
          data: order.reservation.seats.map(({ seat }) => ({
            orderId: order.id,
            eventId: order.eventId,
            userId: order.userId,
            seatId: seat.id,
            status: PrismaTicketStatus.VALID,
            code: generateTicketCode(),
          })),
        });
      }

      const paid = await this.findDetails(tx, order.id);
      if (!paid) {
        throw new OrderNotFoundError();
      }
      return this.toRecord(paid);
    });
  }

  async expireOrder(id: string): Promise<OrderRecord> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(Prisma.sql`
        SELECT "id"
        FROM "Order"
        WHERE "id" = ${id}
        FOR UPDATE
      `);

      const order = await this.findDetails(tx, id);
      if (!order) {
        throw new OrderNotFoundError();
      }
      if (order.status !== PrismaOrderStatus.PENDING) {
        return this.toRecord(order);
      }

      const entity = new OrderEntity(order.id, order.status as OrderStatus);
      entity.markExpired();
      await tx.order.update({
        where: { id: order.id },
        data: { status: PrismaOrderStatus.EXPIRED },
      });
      await tx.reservationSeat.deleteMany({ where: { reservationId: order.reservationId } });
      await tx.reservation.updateMany({
        where: { id: order.reservationId, status: PrismaReservationStatus.HELD },
        data: { status: PrismaReservationStatus.RELEASED },
      });

      const expired = await this.findDetails(tx, order.id);
      if (!expired) {
        throw new OrderNotFoundError();
      }
      return this.toRecord(expired);
    });
  }

  async releasePendingByReservation(reservationId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        select: { status: true, expiresAt: true },
      });
      if (!reservation) {
        return;
      }

      const now = new Date();
      const status =
        reservation.status === PrismaReservationStatus.HELD && reservation.expiresAt <= now
          ? PrismaReservationStatus.EXPIRED
          : PrismaReservationStatus.RELEASED;
      await tx.reservationSeat.deleteMany({ where: { reservationId } });
      await tx.reservation.updateMany({
        where: { id: reservationId, status: PrismaReservationStatus.HELD },
        data: { status },
      });
    });
  }

  async findById(id: string): Promise<OrderRecord | null> {
    const order = await this.findDetails(this.prisma, id);
    return order ? this.toRecord(order) : null;
  }

  async findByUserId(userId: string): Promise<OrderRecord[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: orderDetailsInclude,
      orderBy: { createdAt: 'desc' },
    });
    return orders.map((order) => this.toRecord(order));
  }

  async cancel(id: string): Promise<OrderRecord> {
    return this.prisma.$transaction(async (tx) => {
      const orderReference = await tx.order.findUnique({
        where: { id },
        select: { eventId: true },
      });
      if (!orderReference) {
        throw new OrderNotFoundError();
      }

      await this.assertEventCanBeCheckedOut(tx, orderReference.eventId);

      const order = await this.findDetails(tx, id);
      if (!order) {
        throw new OrderNotFoundError();
      }

      const cancelled = await tx.order.updateMany({
        where: { id, status: PrismaOrderStatus.PAID },
        data: { status: PrismaOrderStatus.CANCELLED },
      });
      if (!cancelled.count) {
        throw new OrderNotPaidError();
      }

      await tx.ticket.deleteMany({ where: { orderId: id } });
      await tx.reservationSeat.deleteMany({ where: { reservationId: order.reservationId } });
      await tx.reservation.update({
        where: { id: order.reservationId },
        data: { status: PrismaReservationStatus.RELEASED },
      });

      return {
        ...this.toRecord(order),
        status: OrderStatus.CANCELLED,
        tickets: [],
      };
    });
  }

  private async assertEventCanBeCheckedOut(
    tx: Prisma.TransactionClient,
    eventId: string,
  ): Promise<void> {
    const status = await this.findEventStatus(tx, eventId);
    if (status !== EventStatus.PUBLISHED) {
      throw new EventNotPublishedError();
    }
  }

  private async findEventStatus(
    tx: Prisma.TransactionClient,
    eventId: string,
  ): Promise<EventStatus | null> {
    const events = await tx.$queryRaw<Array<{ status: EventStatus }>>(
      Prisma.sql`SELECT "status" FROM "Event" WHERE "id" = ${eventId} FOR SHARE`,
    );
    return events[0]?.status ?? null;
  }

  private assertReservationCanBeCheckedOut(
    reservation: { id: string; status: PrismaReservationStatus; expiresAt: Date } | null,
    now: Date,
  ): asserts reservation is {
    id: string;
    status: PrismaReservationStatus;
    expiresAt: Date;
  } {
    if (!reservation) {
      throw new ReservationNotFoundError();
    }
    if (reservation.status !== PrismaReservationStatus.HELD) {
      throw new ReservationNotHeldError();
    }
    if (reservation.expiresAt <= now) {
      throw new ReservationExpiredError();
    }
  }

  private async expirePendingOrder(
    tx: Prisma.TransactionClient,
    orderId: string,
    reservationId: string,
    reservationStatus: PrismaReservationStatus,
  ): Promise<void> {
    const entity = new OrderEntity(orderId, OrderStatus.PENDING);
    entity.markExpired();
    await tx.order.update({
      where: { id: orderId },
      data: { status: PrismaOrderStatus.EXPIRED },
    });
    await tx.reservationSeat.deleteMany({ where: { reservationId } });
    await tx.reservation.updateMany({
      where: { id: reservationId, status: PrismaReservationStatus.HELD },
      data: { status: reservationStatus },
    });
  }

  private async findDetails(
    client: Prisma.TransactionClient | PrismaService,
    id: string,
  ): Promise<OrderWithDetails | null> {
    return client.order.findUnique({
      where: { id },
      include: orderDetailsInclude,
    });
  }

  private toRecord(order: OrderWithDetails): OrderRecord {
    return {
      id: order.id,
      eventId: order.eventId,
      eventTitle: order.event.title,
      userId: order.userId,
      reservationId: order.reservationId,
      status: order.status as OrderStatus,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      seatLabels: order.reservation.seats.map(({ seat }) => seat.label),
      tickets: order.tickets.map((ticket) => ({
        id: ticket.id,
        eventId: ticket.eventId,
        eventTitle: order.event.title,
        seatLabel: ticket.seat.label,
        status: ticket.status as TicketStatus,
        code: ticket.code,
        startsAt: order.event.startsAt,
        venue: order.event.venue,
      })),
    };
  }
}
