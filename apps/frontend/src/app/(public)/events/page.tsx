import { CalendarDays } from 'lucide-react';
import { redirect } from 'next/navigation';
import { EventCard } from '@/features/events/components/event-card';
import { EventFilters } from '@/features/events/components/event-filters';
import {
  buildEventsPageHref,
  EventPagination,
} from '@/features/events/components/event-pagination';
import { eventFiltersSchema, type EventFiltersInput } from '@/features/events/schema';
import { listPublished } from '@/features/events/queries';
import { Container, EmptyState, PageHeader } from '@/shared/ui';

export const dynamic = 'force-dynamic';

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positivePage(value: string | string[] | undefined) {
  const normalized = first(value);
  if (!normalized || !/^\d+$/.test(normalized)) {
    return 1;
  }

  const page = Number(normalized);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const defaults = eventFiltersSchema.parse({
    query: first(raw.query) ?? '',
    dateFrom: first(raw.dateFrom) ?? '',
    dateTo: first(raw.dateTo) ?? '',
    minPrice: first(raw.minPrice) ?? '',
    maxPrice: first(raw.maxPrice) ?? '',
  }) as EventFiltersInput;
  const page = positivePage(raw.page);

  const events = await listPublished({
    query: defaults.query || undefined,
    dateFrom: defaults.dateFrom || undefined,
    dateTo: defaults.dateTo || undefined,
    minPrice: defaults.minPrice ? Number(defaults.minPrice) * 100 : undefined,
    maxPrice: defaults.maxPrice ? Number(defaults.maxPrice) * 100 : undefined,
    page,
    pageSize: 12,
  });

  const totalPages = Math.ceil(events.total / events.pageSize);

  if (events.total > 0 && page > totalPages) {
    redirect(buildEventsPageHref(totalPages, defaults));
  }

  return (
    <Container className="py-10 sm:py-14">
      <PageHeader
        eyebrow="Agenda"
        title="Encontre sua próxima cena"
        description="Busque por título, local, data ou faixa de preço."
      />
      <div className="mt-8">
        <EventFilters defaults={defaults} />
      </div>
      {events.items.length ? (
        <>
          <p className="mt-8 text-sm text-muted-foreground">
            {events.total} {events.total === 1 ? 'evento encontrado' : 'eventos encontrados'}
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {events.items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <EventPagination currentPage={page} totalPages={totalPages} filters={defaults} />
        </>
      ) : (
        <EmptyState
          className="mt-8"
          icon={CalendarDays}
          title="Nenhum evento encontrado"
          description="Tente ajustar os filtros ou volte mais tarde para ver novidades."
        />
      )}
    </Container>
  );
}
