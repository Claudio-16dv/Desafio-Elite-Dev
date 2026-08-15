'use client';

import type { CatalogItem, EventDetail } from '@app/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button, Input, Label, Textarea } from '@/shared/ui';
import { createEvent } from '../actions';
import { localDateTimeToIso } from '../lib/date-time';
import { createEventFormSchema, type CreateEventFormInput } from '../schema';

export function EventCreateForm({
  catalogItem,
  onCreated,
}: {
  catalogItem?: CatalogItem | null;
  onCreated: (event: EventDetail) => void;
}) {
  const form = useForm<CreateEventFormInput>({
    resolver: zodResolver(createEventFormSchema),
    defaultValues: {
      sourceId: catalogItem?.sourceId ?? '',
      title: catalogItem?.title ?? '',
      description: catalogItem?.overview ?? '',
      imageUrl: catalogItem?.imageUrl ?? '',
      venue: '',
      startsAt: '',
      price: '0',
      rows: 5,
      columns: 8,
    },
  });

  const rows = form.watch('rows');
  const columns = form.watch('columns');

  async function onSubmit(values: CreateEventFormInput) {
    try {
      const event = await createEvent({
        ...values,
        startsAt: localDateTimeToIso(values.startsAt),
      });
      toast.success('Evento criado como rascunho. Revise e publique quando estiver pronto.');
      onCreated(event);
    } catch {
      toast.error('Não foi possível criar o evento. Revise os dados e tente novamente.');
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
      <input type="hidden" {...form.register('sourceId')} />
      <div className="grid gap-2">
        <Label htmlFor="event-title">Título</Label>
        <Input id="event-title" placeholder="Nome do evento" {...form.register('title')} />
        {form.formState.errors.title ? (
          <p className="text-sm text-danger">{form.formState.errors.title.message}</p>
        ) : null}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="event-description">Descrição</Label>
        <Textarea
          id="event-description"
          placeholder="Conte o que torna esta experiência especial."
          {...form.register('description')}
        />
        {form.formState.errors.description ? (
          <p className="text-sm text-danger">{form.formState.errors.description.message}</p>
        ) : null}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Local" error={form.formState.errors.venue?.message}>
          <Input
            id="event-venue"
            placeholder="Teatro, arena ou endereço"
            {...form.register('venue')}
          />
        </Field>
        <Field label="Data e horário" error={form.formState.errors.startsAt?.message}>
          <Input id="event-starts-at" type="datetime-local" {...form.register('startsAt')} />
        </Field>
        <Field label="Preço (R$)" error={form.formState.errors.price?.message}>
          <Input
            id="event-price"
            inputMode="decimal"
            placeholder="45,90"
            {...form.register('price')}
          />
        </Field>
        <Field label="Imagem (URL)" error={form.formState.errors.imageUrl?.message}>
          <Input
            id="event-image"
            type="url"
            placeholder="https://..."
            {...form.register('imageUrl')}
          />
        </Field>
      </div>
      <fieldset className="rounded-[--radius] border border-border p-4">
        <legend className="px-2 text-sm font-medium">Grade de assentos</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Fileiras" error={form.formState.errors.rows?.message}>
            <Input
              id="event-rows"
              type="number"
              min="1"
              max="26"
              {...form.register('rows', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Assentos por fileira" error={form.formState.errors.columns?.message}>
            <Input
              id="event-columns"
              type="number"
              min="1"
              max="50"
              {...form.register('columns', { valueAsNumber: true })}
            />
          </Field>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Capacidade estimada:{' '}
          <strong className="text-foreground">
            {Number.isFinite(rows) && Number.isFinite(columns) ? rows * columns : 0} lugares
          </strong>
        </p>
      </fieldset>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <CalendarPlus className="size-4" />
        {form.formState.isSubmitting ? 'Criando evento…' : 'Criar evento'}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
