import 'server-only';

import type {
  CatalogItem,
  EventDetail,
  EventSummary,
  OrganizerEventSummary,
  Paginated,
  SeatResponse,
} from '@app/shared';
import { ApiError, api } from '@/shared/api';

export interface EventListFilters {
  query?: string;
  dateFrom?: string;
  dateTo?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

function toQueryString(filters: EventListFilters) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function listPublished(
  filters: EventListFilters = {},
): Promise<Paginated<EventSummary>> {
  return api.get<Paginated<EventSummary>>(
    `/events${toQueryString({ page: 1, pageSize: 12, ...filters })}`,
  );
}

export async function listMyEvents(
  filters: Pick<EventListFilters, 'page' | 'pageSize'> = {},
): Promise<Paginated<OrganizerEventSummary>> {
  return api.get<Paginated<OrganizerEventSummary>>(
    `/events/mine${toQueryString({ page: 1, pageSize: 24, ...filters })}`,
  );
}

export async function getMyEventById(id: string): Promise<EventDetail | null> {
  try {
    return await api.get<EventDetail>(`/events/mine/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getEventById(id: string): Promise<EventDetail | null> {
  try {
    return await api.get<EventDetail>(`/events/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function getSeats(eventId: string): Promise<SeatResponse[]> {
  return api.get<SeatResponse[]>(`/events/${eventId}/seats`);
}

export async function searchCatalog(query: string): Promise<CatalogItem[]> {
  const normalized = query.trim();

  if (normalized.length < 2) {
    return [];
  }

  return api.get<CatalogItem[]>(`/catalog/search?${new URLSearchParams({ query: normalized })}`);
}

export async function getCatalogItem(sourceId: string): Promise<CatalogItem | null> {
  try {
    return await api.get<CatalogItem>(`/catalog/${sourceId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
