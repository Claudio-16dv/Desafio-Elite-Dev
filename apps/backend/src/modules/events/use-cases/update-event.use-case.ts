import { Injectable } from '@nestjs/common';
import { EventDetail, UpdateEventRequest } from '@app/shared';
import { EventEntity } from '../entities/event.entity';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { toEventDetail } from '../event-response.mapper';
import { EventsRepository } from '../repositories/events.repository';

@Injectable()
export class UpdateEventUseCase {
  constructor(private readonly events: EventsRepository) {}

  async execute(id: string, input: UpdateEventRequest, userId: string): Promise<EventDetail> {
    const event = await this.events.findById(id);
    if (!event) {
      throw new EventNotFoundError();
    }

    const entity = new EventEntity(event.id, event.organizerId, event.status);
    entity.assertOwnedBy(userId);
    entity.assertCanBeUpdated();

    const updated = await this.events.update(id, {
      title: input.title,
      description: input.description,
      venue: input.venue,
      startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
      priceCents: input.priceCents,
      imageUrl: input.imageUrl,
    });
    const seats = await this.events.findSeats(updated.id, new Date());
    return toEventDetail(updated, seats);
  }
}
