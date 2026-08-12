import { Injectable } from '@nestjs/common';
import { Event, EventStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { EventLifecycleStatus } from '../entities/event.entity';
import {
  CreateEventInput,
  EventRecord,
  EventsRepository,
  ListPublishedEventsInput,
  ListPublishedEventsResult,
  SeatRecord,
  UpdateEventInput,
} from './events.repository';

@Injectable()
export class PrismaEventsRepository extends EventsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async createWithSeats(input: CreateEventInput): Promise<EventRecord> {
    const event = await this.prisma.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: {
          title: input.title,
          description: input.description,
          venue: input.venue,
          startsAt: input.startsAt,
          priceCents: input.priceCents,
          rows: input.rows,
          columns: input.columns,
          capacity: input.capacity,
          sourceId: input.sourceId,
          imageUrl: input.imageUrl,
          organizerId: input.organizerId,
        },
      });

      await tx.seat.createMany({
        data: input.seats.map((seat) => ({ ...seat, eventId: created.id })),
      });

      return created;
    });

    return this.toRecord(event);
  }

  async update(id: string, input: UpdateEventInput): Promise<EventRecord> {
    const data: Prisma.EventUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.venue !== undefined) data.venue = input.venue;
    if (input.startsAt !== undefined) data.startsAt = input.startsAt;
    if (input.priceCents !== undefined) data.priceCents = input.priceCents;
    if (input.imageUrl !== undefined) data.imageUrl = input.imageUrl;
    if (input.status !== undefined) data.status = input.status as EventStatus;

    const event = await this.prisma.event.update({ where: { id }, data });
    return this.toRecord(event);
  }

  async findById(id: string): Promise<EventRecord | null> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    return event ? this.toRecord(event) : null;
  }

  async listPublished(input: ListPublishedEventsInput): Promise<ListPublishedEventsResult> {
    const where: Prisma.EventWhereInput = { status: EventStatus.PUBLISHED };

    if (input.query) {
      where.title = { contains: input.query, mode: 'insensitive' };
    }
    if (input.dateFrom || input.dateTo) {
      where.startsAt = {
        ...(input.dateFrom ? { gte: input.dateFrom } : {}),
        ...(input.dateTo ? { lte: input.dateTo } : {}),
      };
    }
    if (input.minPrice !== undefined || input.maxPrice !== undefined) {
      where.priceCents = {
        ...(input.minPrice !== undefined ? { gte: input.minPrice } : {}),
        ...(input.maxPrice !== undefined ? { lte: input.maxPrice } : {}),
      };
    }

    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        orderBy: { startsAt: 'asc' },
        skip: input.skip,
        take: input.take,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { items: events.map((event) => this.toRecord(event)), total };
  }

  async findSeats(eventId: string, now: Date): Promise<SeatRecord[]> {
    const seats = await this.prisma.seat.findMany({
      where: { eventId },
      orderBy: [{ rowLabel: 'asc' }, { column: 'asc' }],
      select: {
        id: true,
        label: true,
        rowLabel: true,
        column: true,
        reservationSeats: {
          where: {
            reservation: {
              OR: [
                { status: 'CONFIRMED' },
                { status: 'HELD', expiresAt: { gt: now } },
              ],
            },
          },
          select: { id: true },
          take: 1,
        },
      },
    });

    return seats.map((seat) => ({
      id: seat.id,
      label: seat.label,
      rowLabel: seat.rowLabel,
      column: seat.column,
      taken: seat.reservationSeats.length > 0,
    }));
  }

  private toRecord(event: Event): EventRecord {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      venue: event.venue,
      startsAt: event.startsAt,
      priceCents: event.priceCents,
      rows: event.rows,
      columns: event.columns,
      capacity: event.capacity,
      status: event.status as EventLifecycleStatus,
      source: event.source,
      sourceId: event.sourceId,
      imageUrl: event.imageUrl,
      organizerId: event.organizerId,
    };
  }
}
