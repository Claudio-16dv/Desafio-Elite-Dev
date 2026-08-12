import { Injectable } from '@nestjs/common';
import { CreateEventRequest, EventDetail } from '@app/shared';
import { CatalogProvider } from '../../catalog/providers/catalog-provider';
import { toEventDetail } from '../event-response.mapper';
import { EventsRepository, SeatRecord } from '../repositories/events.repository';

@Injectable()
export class CreateEventUseCase {
  constructor(
    private readonly events: EventsRepository,
    private readonly catalog: CatalogProvider,
  ) {}

  async execute(input: CreateEventRequest, organizerId: string): Promise<EventDetail> {
    const catalogItem = input.sourceId ? await this.catalog.getById(input.sourceId) : null;
    const seats = this.generateSeats(input.rows, input.columns);
    const event = await this.events.createWithSeats({
      title: catalogItem?.title ?? input.title,
      description: input.description ?? catalogItem?.overview,
      venue: input.venue,
      startsAt: new Date(input.startsAt),
      priceCents: input.priceCents,
      rows: input.rows,
      columns: input.columns,
      capacity: input.rows * input.columns,
      sourceId: input.sourceId,
      imageUrl: input.imageUrl ?? catalogItem?.imageUrl,
      organizerId,
      seats,
    });

    const persistedSeats = await this.events.findSeats(event.id, new Date());
    return toEventDetail(event, persistedSeats);
  }

  private generateSeats(rows: number, columns: number): Array<Pick<SeatRecord, 'label' | 'rowLabel' | 'column'>> {
    return Array.from({ length: rows }, (_, rowIndex) => {
      const rowLabel = String.fromCharCode(65 + rowIndex);
      return Array.from({ length: columns }, (_, columnIndex) => ({
        label: `${rowLabel}${columnIndex + 1}`,
        rowLabel,
        column: columnIndex + 1,
      }));
    }).flat();
  }
}
