import { Injectable } from '@nestjs/common';
import { EventStatus, Prisma, Ticket, TicketStatus as PrismaTicketStatus } from '@prisma/client';
import { EventLifecycleStatus, TicketStatus } from '@app/shared';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { TicketEventCancelledError } from '../errors/ticket-event-cancelled.error';
import { TicketNotFoundError } from '../errors/ticket-not-found.error';
import { TicketRecord, TicketsRepository } from './tickets.repository';

type TicketWithDetails = Prisma.TicketGetPayload<{
  include: {
    event: {
      select: {
        title: true;
        startsAt: true;
        venue: true;
        status: true;
        organizerId: true;
      };
    };
    seat: {
      select: {
        label: true;
      };
    };
  };
}>;

@Injectable()
export class PrismaTicketsRepository extends TicketsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: string): Promise<TicketRecord[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      include: this.detailsInclude,
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map((ticket) => this.toRecord(ticket));
  }

  async findById(id: string): Promise<TicketRecord | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: this.detailsInclude,
    });
    return ticket ? this.toRecord(ticket) : null;
  }

  async findByShareToken(shareToken: string): Promise<TicketRecord | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { shareToken },
      include: this.detailsInclude,
    });
    return ticket ? this.toRecord(ticket) : null;
  }

  async findByCode(code: string): Promise<TicketRecord | null> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { code },
      include: this.detailsInclude,
    });
    return ticket ? this.toRecord(ticket) : null;
  }

  async setShareToken(id: string, shareToken: string): Promise<TicketRecord> {
    const updated = await this.prisma.ticket.updateMany({
      where: {
        id,
        status: { not: PrismaTicketStatus.EVENT_CANCELLED },
        event: { status: EventStatus.PUBLISHED },
      },
      data: { shareToken },
    });

    if (!updated.count) {
      const ticket = await this.findById(id);
      if (!ticket) {
        throw new TicketNotFoundError();
      }
      throw new TicketEventCancelledError();
    }

    const ticket = await this.findById(id);
    if (!ticket) {
      throw new TicketNotFoundError();
    }
    return ticket;
  }

  async markUsedIfValid(id: string, now: Date): Promise<number> {
    const result = await this.prisma.ticket.updateMany({
      where: {
        id,
        status: PrismaTicketStatus.VALID,
        event: { status: EventStatus.PUBLISHED },
      },
      data: { status: PrismaTicketStatus.USED, usedAt: now },
    });
    return result.count;
  }

  private readonly detailsInclude = {
    event: {
      select: {
        title: true,
        startsAt: true,
        venue: true,
        status: true,
        organizerId: true,
      },
    },
    seat: {
      select: {
        label: true,
      },
    },
  } satisfies Prisma.TicketInclude;

  private toRecord(ticket: TicketWithDetails | Ticket): TicketRecord {
    if (!('event' in ticket) || !('seat' in ticket)) {
      throw new TicketNotFoundError();
    }

    return {
      id: ticket.id,
      orderId: ticket.orderId,
      eventId: ticket.eventId,
      userId: ticket.userId,
      seatId: ticket.seatId,
      status: ticket.status as TicketStatus,
      code: ticket.code,
      shareToken: ticket.shareToken,
      usedAt: ticket.usedAt,
      event: {
        title: ticket.event.title,
        startsAt: ticket.event.startsAt,
        venue: ticket.event.venue,
        status: ticket.event.status as EventLifecycleStatus,
        organizerId: ticket.event.organizerId,
      },
      seat: { label: ticket.seat.label },
    };
  }
}
