import { Injectable } from '@nestjs/common';
import { EventSummary, Paginated } from '@app/shared';
import { ListEventsDto } from '../dto/list-events.dto';
import { toEventSummary } from '../event-response.mapper';
import { EventsRepository } from '../repositories/events.repository';

@Injectable()
export class ListEventsUseCase {
  constructor(private readonly events: EventsRepository) {}

  async execute(input: ListEventsDto): Promise<Paginated<EventSummary>> {
    const page = input.page;
    const pageSize = input.pageSize;
    const result = await this.events.listPublished({
      query: input.query,
      dateFrom: input.dateFrom ? new Date(input.dateFrom) : undefined,
      dateTo: input.dateTo ? new Date(input.dateTo) : undefined,
      minPrice: input.minPrice,
      maxPrice: input.maxPrice,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: result.items.map(toEventSummary),
      total: result.total,
      page,
      pageSize,
    };
  }
}
