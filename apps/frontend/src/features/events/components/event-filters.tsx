'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, Input, Label } from '@/shared/ui';
import { eventFiltersSchema, type EventFiltersInput } from '../schema';

export function EventFilters({ defaults }: { defaults: EventFiltersInput }) {
  const router = useRouter();
  const form = useForm<EventFiltersInput>({
    resolver: zodResolver(eventFiltersSchema),
    defaultValues: defaults,
  });

  function onSubmit(values: EventFiltersInput) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(values)) {
      if (value) {
        params.set(key, value);
      }
    }

    const query = params.toString();
    router.push(query ? `/events?${query}` : '/events');
  }

  function clearFilters() {
    form.reset({ query: '', dateFrom: '', dateTo: '', minPrice: '', maxPrice: '' });
    router.push('/events');
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className="grid gap-4 rounded-[--radius] border border-border bg-card/60 p-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_auto] lg:items-end"
    >
      <div className="grid gap-2">
        <Label htmlFor="event-query">Buscar</Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="event-query"
            placeholder="Título ou local"
            className="pl-9"
            {...form.register('query')}
          />
        </div>
        {form.formState.errors.query ? (
          <p className="text-xs text-danger">{form.formState.errors.query.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="event-date-from">A partir de</Label>
        <Input id="event-date-from" type="date" {...form.register('dateFrom')} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="event-min-price">Preço mín. (R$)</Label>
        <Input
          id="event-min-price"
          inputMode="numeric"
          placeholder="0"
          {...form.register('minPrice')}
        />
        {form.formState.errors.minPrice ? (
          <p className="text-xs text-danger">{form.formState.errors.minPrice.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="event-max-price">Preço máx. (R$)</Label>
        <Input
          id="event-max-price"
          inputMode="numeric"
          placeholder="200"
          {...form.register('maxPrice')}
        />
        {form.formState.errors.maxPrice ? (
          <p className="text-xs text-danger">{form.formState.errors.maxPrice.message}</p>
        ) : null}
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1 lg:flex-none">
          <SlidersHorizontal className="size-4" />
          Filtrar
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Limpar filtros"
          onClick={clearFilters}
        >
          <X className="size-4" />
        </Button>
      </div>
    </form>
  );
}
