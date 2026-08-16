import { Injectable } from '@nestjs/common';
import { EventSummary } from '@app/shared';
import { toEventSummary } from '../../events/event-response.mapper';
import { EventsRepository } from '../../events/repositories/events.repository';

@Injectable()
export class ListGateEventsUseCase {
  constructor(private readonly events: EventsRepository) {}

  async execute(organizerId: string | null): Promise<EventSummary[]> {
    if (!organizerId) {
      return [];
    }

    const events = await this.events.listPublishedByOrganizer(organizerId);
    return events.map(toEventSummary);
  }
}
