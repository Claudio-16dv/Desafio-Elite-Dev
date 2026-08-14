import { EventDetail, EventSummary, OrganizerEventSummary, SeatResponse } from '@app/shared';
import { EventRecord, SeatRecord } from './repositories/events.repository';

export function toEventSummary(event: EventRecord): EventSummary {
  return {
    id: event.id,
    title: event.title,
    date: event.startsAt.toISOString(),
    venue: event.venue,
    priceCents: event.priceCents,
    imageUrl: event.imageUrl ?? undefined,
  };
}

export function toOrganizerEventSummary(event: EventRecord): OrganizerEventSummary {
  return {
    ...toEventSummary(event),
    description: event.description ?? undefined,
    capacity: event.capacity,
    status: event.status,
  };
}

export function toEventDetail(event: EventRecord, seats: SeatRecord[] = []): EventDetail {
  return {
    ...toEventSummary(event),
    description: event.description ?? undefined,
    capacity: event.capacity,
    available: event.capacity - seats.filter((seat) => seat.taken).length,
    status: event.status,
    seats: seats.length ? seats.map(toSeatResponse) : undefined,
  };
}

export function toSeatResponse(seat: SeatRecord): SeatResponse {
  return {
    id: seat.id,
    label: seat.label,
    rowLabel: seat.rowLabel,
    column: seat.column,
    taken: seat.taken,
  };
}
