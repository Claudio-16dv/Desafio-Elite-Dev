import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui';
import type { EventFiltersInput } from '../schema';

interface EventPaginationProps {
  currentPage: number;
  totalPages: number;
  filters: EventFiltersInput;
}

export function buildEventsPageHref(page: number, filters: EventFiltersInput) {
  const params = new URLSearchParams();
  const entries = [
    ['query', filters.query],
    ['dateFrom', filters.dateFrom],
    ['dateTo', filters.dateTo],
    ['minPrice', filters.minPrice],
    ['maxPrice', filters.maxPrice],
  ] as const;

  for (const [key, value] of entries) {
    if (value) {
      params.set(key, value);
    }
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();
  return query ? '/events?' + query : '/events';
}

function visiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return [...pages].filter((page) => page >= 1 && page <= totalPages).sort((a, b) => a - b);
}

export function EventPagination({ currentPage, totalPages, filters }: EventPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = visiblePages(currentPage, totalPages);

  return (
    <nav
      aria-label="Paginação dos eventos"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Button asChild variant="outline" size="sm" className="gap-1 px-3">
          <Link
            href={buildEventsPageHref(currentPage - 1, filters)}
            aria-label="Ir para a página anterior"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 px-3"
          aria-label="Página anterior indisponível"
          disabled
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>
      )}

      {pages.map((page, index) => {
        const previousPage = pages[index - 1];
        const hasGap = previousPage !== undefined && page - previousPage > 1;
        const current = page === currentPage;

        return (
          <span key={page} className="contents">
            {hasGap ? (
              <span
                aria-hidden="true"
                className="grid size-9 place-items-center text-muted-foreground"
              >
                …
              </span>
            ) : null}
            <Button
              asChild
              variant={current ? 'primary' : 'outline'}
              size="sm"
              className="size-9 px-0"
            >
              <Link
                href={buildEventsPageHref(page, filters)}
                aria-label={'Ir para a página ' + page}
                aria-current={current ? 'page' : undefined}
              >
                {page}
              </Link>
            </Button>
          </span>
        );
      })}

      {currentPage < totalPages ? (
        <Button asChild variant="outline" size="sm" className="gap-1 px-3">
          <Link
            href={buildEventsPageHref(currentPage + 1, filters)}
            aria-label="Ir para a próxima página"
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 px-3"
          aria-label="Próxima página indisponível"
          disabled
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      )}
    </nav>
  );
}
