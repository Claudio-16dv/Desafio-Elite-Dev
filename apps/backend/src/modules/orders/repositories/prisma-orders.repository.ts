import { Injectable } from '@nestjs/common';
import {
  OrderStatus as PrismaOrderStatus,
  Prisma,
  ReservationStatus as PrismaReservationStatus,
} from '@prisma/client';
import { OrderStatus, TicketStatus } from '@app/shared';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ReservationExpiredError } from '../../reservations/errors/reservation-expired.error';
import { ReservationNotHeldError } from '../../reservations/errors/reservation-not-held.error';
import { ReservationNotFoundError } from '../../reservations/errors/reservation-not-found.error';
import { OrderNotFoundError } from '../errors/order-not-found.error';
import {
  CreatePaidOrderInput,
  CreateRefusedOrderInput,
  OrderRecord,
  OrdersRepository,
} from './orders.repository';

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

  async createPaidOrderWithTickets(input: CreatePaidOrderInput): Promise<OrderRecord> {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: input.reservationId },
        select: { id: true, status: true, expiresAt: true },
      });
      this.assertReservationCanBeCheckedOut(reservation, input.now);

      const confirmed = await tx.reservation.updateMany({
        where: {
          id: input.reservationId,
          status: PrismaReservationStatus.HELD,
          expiresAt: { gt: input.now },
        },
        data: { status: PrismaReservationStatus.CONFIRMED },
      });
      if (!confirmed.count) {
        throw new ReservationNotHeldError();
      }

      const order = await tx.order.create({
        data: {
          eventId: input.eventId,
          userId: input.userId,
          reservationId: input.reservationId,
          status: PrismaOrderStatus.PAID,
          totalCents: input.totalCents,
        },
      });

      await tx.ticket.createMany({
        data: input.tickets.map((ticket) => ({
          orderId: order.id,
          eventId: input.eventId,
          userId: input.userId,
          seatId: ticket.seatId,
          status: 'VALID',
          code: ticket.code,
        })),
      });

      const created = await this.findDetails(tx, order.id);
      if (!created) {
        throw new OrderNotFoundError();
      }
      return this.toRecord(created);
    });
  }

  async createRefusedOrderAndRelease(input: CreateRefusedOrderInput): Promise<OrderRecord> {
    return this.prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: input.reservationId },
        select: { id: true, status: true, expiresAt: true },
      });
      this.assertReservationCanBeCheckedOut(reservation, input.now);

      const released = await tx.reservation.updateMany({
        where: {
          id: input.reservationId,
          status: PrismaReservationStatus.HELD,
          expiresAt: { gt: input.now },
        },
        data: { status: PrismaReservationStatus.RELEASED },
      });
      if (!released.count) {
        throw new ReservationNotHeldError();
      }

      await tx.reservationSeat.deleteMany({ where: { reservationId: input.reservationId } });
      const order = await tx.order.create({
        data: {
          eventId: input.eventId,
          userId: input.userId,
          reservationId: input.reservationId,
          status: PrismaOrderStatus.REFUSED,
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
      const order = await this.findDetails(tx, id);
      if (!order) {
        throw new OrderNotFoundError();
      }

      await tx.order.update({
        where: { id },
        data: { status: PrismaOrderStatus.CANCELLED },
      });
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

  private findDetails(
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
