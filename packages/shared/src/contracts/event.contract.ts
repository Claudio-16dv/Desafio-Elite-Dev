import { SeatResponse } from './seat.contract';

export type EventLifecycleStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

export interface CreateEventRequest {
  sourceId?: string;
  title: string;
  description?: string;
  venue: string;
  startsAt: string;
  priceCents: number;
  rows: number;
  columns: number;
  imageUrl?: string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  venue?: string;
  startsAt?: string;
  priceCents?: number;
  imageUrl?: string;
}

export interface EventSummary {
  id: string;
  title: string;
  date: string; // ISO 8601
  venue: string;
  priceCents: number;
  imageUrl?: string;
}

export interface OrganizerEventSummary extends EventSummary {
  description?: string;
  capacity: number;
  status: EventLifecycleStatus;
}

export interface EventDetail extends EventSummary {
  description?: string;
  capacity: number;
  available: number;
  status: EventLifecycleStatus;
  seats?: SeatResponse[];
}
