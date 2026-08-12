import { Injectable } from '@nestjs/common';
import { EventDetail } from '@app/shared';
import { EventEntity } from '../entities/event.entity';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { toEventDetail } from '../event-response.mapper';
import { EventsRepository } from '../repositories/events.repository';

@Injectable()
export class PublishEventUseCase {
  constructor(private readonly events: EventsRepository) {}

  async execute(id: string, userId: string): Promise<EventDetail> {
    const event = await this.events.findById(id);
    if (!event) {
      throw new EventNotFoundError();
    }

    const entity = new EventEntity(event.id, event.organizerId, event.status);
    entity.assertOwnedBy(userId);
    entity.publish();

    const updated = await this.events.update(id, { status: entity.getStatus() });
    const seats = await this.events.findSeats(updated.id, new Date());
    return toEventDetail(updated, seats);
  }
}
