'use server';

import type { CatalogItem, CreateEventRequest, EventDetail, UpdateEventRequest } from '@app/shared';
import { api } from '@/shared/api';
import {
  catalogSearchSchema,
  createEventFormSchema,
  eventIdSchema,
  updateEventFormSchema,
} from './schema';
import { searchCatalog } from './queries';

function priceToCents(value: string) {
  return Math.round(Number(value.replace(',', '.')) * 100);
}

function toOptional(value: string | undefined) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export async function searchEventCatalog(input: unknown): Promise<CatalogItem[]> {
  const data = catalogSearchSchema.parse(input);
  return searchCatalog(data.query);
}

export async function createEvent(input: unknown): Promise<EventDetail> {
  const data = createEventFormSchema.parse(input);
  const request: CreateEventRequest = {
    sourceId: toOptional(data.sourceId),
    title: data.title,
    description: toOptional(data.description),
    venue: data.venue,
    startsAt: new Date(data.startsAt).toISOString(),
    priceCents: priceToCents(data.price),
    rows: data.rows,
    columns: data.columns,
    imageUrl: toOptional(data.imageUrl),
  };

  return api.post<EventDetail>('/events', request);
}

export async function updateEvent(eventId: unknown, input: unknown): Promise<EventDetail> {
  const id = eventIdSchema.parse(eventId);
  const data = updateEventFormSchema.parse(input);
  const request: UpdateEventRequest = {
    title: data.title,
    description: toOptional(data.description),
    venue: data.venue,
    startsAt: new Date(data.startsAt).toISOString(),
    priceCents: priceToCents(data.price),
    imageUrl: toOptional(data.imageUrl),
  };

  return api.patch<EventDetail>(`/events/${id}`, request);
}

export async function publishEvent(eventId: unknown): Promise<EventDetail> {
  const id = eventIdSchema.parse(eventId);
  return api.post<EventDetail>(`/events/${id}/publish`);
}

export async function cancelEvent(eventId: unknown): Promise<EventDetail> {
  const id = eventIdSchema.parse(eventId);
  return api.post<EventDetail>(`/events/${id}/cancel`);
}
