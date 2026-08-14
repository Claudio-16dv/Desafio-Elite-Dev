import { Injectable } from '@nestjs/common';
import { EventDetail } from '@app/shared';
import { EventEntity } from '../entities/event.entity';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { toEventDetail } from '../event-response.mapper';
import { EventsRepository } from '../repositories/events.repository';

@Injectable()
export class GetMyEventUseCase {
  constructor(private readonly events: EventsRepository) {}

  async execute(id: string, organizerId: string): Promise<EventDetail> {
    const event = await this.events.findById(id);
    if (!event) {
      throw new EventNotFoundError();
    }

    new EventEntity(event.id, event.organizerId, event.status).assertOwnedBy(organizerId);
    const seats = await this.events.findSeats(id, new Date());
    return toEventDetail(event, seats);
  }
}
