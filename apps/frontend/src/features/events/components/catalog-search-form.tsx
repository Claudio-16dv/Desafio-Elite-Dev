'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button, Input, Label } from '@/shared/ui';
import { catalogSearchSchema, type CatalogSearchInput } from '../schema';

export function CatalogSearchForm({ onSearch }: { onSearch: (query: string) => Promise<void> }) {
  const form = useForm<CatalogSearchInput>({
    resolver: zodResolver(catalogSearchSchema),
    defaultValues: { query: '' },
  });

  async function onSubmit(values: CatalogSearchInput) {
    await onSearch(values.query);
  }

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="grid flex-1 gap-2">
        <Label htmlFor="catalog-query">Buscar no catálogo</Label>
        <Input
          id="catalog-query"
          placeholder="Filme, show ou espetáculo"
          {...form.register('query')}
        />
        {form.formState.errors.query ? (
          <p className="text-sm text-danger">{form.formState.errors.query.message}</p>
        ) : null}
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <Search className="size-4" />
        {form.formState.isSubmitting ? 'Buscando…' : 'Buscar'}
      </Button>
    </form>
  );
}
