import type { EventLifecycleStatus } from '@app/shared';

export interface EventRecord {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  startsAt: Date;
  priceCents: number;
  rows: number;
  columns: number;
  capacity: number;
  status: EventLifecycleStatus;
  source: string;
  sourceId: string | null;
  imageUrl: string | null;
  organizerId: string;
}

export interface SeatRecord {
  id: string;
  label: string;
  rowLabel: string;
  column: number;
  taken: boolean;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  venue: string;
  startsAt: Date;
  priceCents: number;
  rows: number;
  columns: number;
  capacity: number;
  sourceId?: string;
  imageUrl?: string;
  organizerId: string;
  seats: Array<Pick<SeatRecord, 'label' | 'rowLabel' | 'column'>>;
}

export interface UpdateEventInput {
  title?: string;
  description?: string;
  venue?: string;
  startsAt?: Date;
  priceCents?: number;
  imageUrl?: string;
  status?: EventLifecycleStatus;
}

export interface ListPublishedEventsInput {
  query?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minPrice?: number;
  maxPrice?: number;
  skip: number;
  take: number;
}

export interface ListPublishedEventsResult {
  items: EventRecord[];
  total: number;
}

export interface ListOrganizerEventsInput {
  organizerId: string;
  skip: number;
  take: number;
}

export abstract class EventsRepository {
  abstract createWithSeats(input: CreateEventInput): Promise<EventRecord>;
  abstract update(id: string, input: UpdateEventInput): Promise<EventRecord>;
  abstract cancel(id: string): Promise<EventRecord>;
  abstract findById(id: string): Promise<EventRecord | null>;
  abstract listPublished(input: ListPublishedEventsInput): Promise<ListPublishedEventsResult>;
  abstract listByOrganizer(input: ListOrganizerEventsInput): Promise<ListPublishedEventsResult>;
  abstract findSeats(eventId: string, now: Date): Promise<SeatRecord[]>;
}
