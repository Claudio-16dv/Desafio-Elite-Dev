import { Injectable } from '@nestjs/common';
import { Prisma, Ticket } from '@prisma/client';
import { TicketStatus } from '@app/shared';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { TicketNotFoundError } from '../errors/ticket-not-found.error';
import { TicketRecord, TicketsRepository } from './tickets.repository';

type TicketWithDetails = Prisma.TicketGetPayload<{
  include: {
    event: {
      select: {
        title: true;
        startsAt: true;
        venue: true;
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
    const ticket = await this.prisma.ticket.findUnique({ where: { id }, include: this.detailsInclude });
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
    const ticket = await this.prisma.ticket.findUnique({ where: { code }, include: this.detailsInclude });
    return ticket ? this.toRecord(ticket) : null;
  }

  async setShareToken(id: string, shareToken: string): Promise<TicketRecord> {
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: { shareToken },
      include: this.detailsInclude,
    });
    return this.toRecord(ticket);
  }

  async markUsedIfValid(id: string, now: Date): Promise<number> {
    const result = await this.prisma.ticket.updateMany({
      where: { id, status: 'VALID' },
      data: { status: 'USED', usedAt: now },
    });
    return result.count;
  }

  private readonly detailsInclude = {
    event: {
      select: {
        title: true,
        startsAt: true,
        venue: true,
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
      },
      seat: { label: ticket.seat.label },
    };
  }
}
