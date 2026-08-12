import { Injectable } from '@nestjs/common';
import { SeatResponse } from '@app/shared';
import { EventNotFoundError } from '../errors/event-not-found.error';
import { toSeatResponse } from '../event-response.mapper';
import { EventsRepository } from '../repositories/events.repository';

@Injectable()
export class GetEventSeatsUseCase {
  constructor(private readonly events: EventsRepository) {}

  async execute(eventId: string): Promise<SeatResponse[]> {
    const event = await this.events.findById(eventId);
    if (!event) {
      throw new EventNotFoundError();
    }

    const seats = await this.events.findSeats(eventId, new Date());
    return seats.map(toSeatResponse);
  }
}
