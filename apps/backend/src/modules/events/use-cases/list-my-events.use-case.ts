import { Injectable } from '@nestjs/common';
import { OrganizerEventSummary, Paginated } from '@app/shared';
import { ListMyEventsDto } from '../dto/list-my-events.dto';
import { toOrganizerEventSummary } from '../event-response.mapper';
import { EventsRepository } from '../repositories/events.repository';

@Injectable()
export class ListMyEventsUseCase {
  constructor(private readonly events: EventsRepository) {}

  async execute(
    input: ListMyEventsDto,
    organizerId: string,
  ): Promise<Paginated<OrganizerEventSummary>> {
    const page = input.page;
    const pageSize = input.pageSize;
    const result = await this.events.listByOrganizer({
      organizerId,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: result.items.map(toOrganizerEventSummary),
      total: result.total,
      page,
      pageSize,
    };
  }
}
