'use client';

import type { EventLifecycleStatus, OrganizerEventSummary } from '@app/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, Save, Send, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Badge,
  type BadgeProps,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@/shared/ui';
import { cancelEvent, publishEvent, updateEvent } from '../actions';
import { isoToLocalDateTime, localDateTimeToIso } from '../lib/date-time';
import { updateEventFormSchema, type UpdateEventFormInput } from '../schema';

const statusConfig: Record<
  EventLifecycleStatus,
  { label: string; variant: BadgeProps['variant']; description: string }
> = {
  DRAFT: {
    label: 'Rascunho',
    variant: 'warning',
    description: 'Revise as informações antes de disponibilizar o evento ao público.',
  },
  PUBLISHED: {
    label: 'Publicado',
    variant: 'success',
    description: 'O evento está em cartaz. Você ainda pode atualizar suas informações.',
  },
  CANCELLED: {
    label: 'Cancelado',
    variant: 'danger',
    description: 'Este evento permanece no histórico e não aceita novas alterações.',
  },
};

function formValues(event: OrganizerEventSummary): UpdateEventFormInput {
  return {
    title: event.title,
    description: event.description ?? '',
    venue: event.venue,
    startsAt: isoToLocalDateTime(event.date),
    price: String(event.priceCents / 100).replace('.', ','),
    imageUrl: event.imageUrl ?? '',
  };
}

export function EventManagementPanel({ event }: { event: OrganizerEventSummary }) {
  const router = useRouter();
  const [actionPending, setActionPending] = useState(false);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const canEdit = event.status !== 'CANCELLED';
  const canPublish = event.status === 'DRAFT';
  const canCancel = event.status === 'DRAFT' || event.status === 'PUBLISHED';
  const status = statusConfig[event.status];
  const form = useForm<UpdateEventFormInput>({
    resolver: zodResolver(updateEventFormSchema),
    defaultValues: formValues(event),
  });

  useEffect(() => {
    form.reset(formValues(event));
  }, [event, form]);

  async function save(values: UpdateEventFormInput) {
    if (!canEdit) {
      return;
    }

    try {
      await updateEvent(event.id, {
        ...values,
        startsAt: localDateTimeToIso(values.startsAt),
      });
      toast.success('Alterações salvas.');
      router.refresh();
    } catch {
      toast.error('Não foi possível salvar as alterações deste evento.');
    }
  }

  async function transition(kind: 'publish' | 'cancel') {
    setActionPending(true);
    try {
      if (kind === 'publish') {
        await publishEvent(event.id);
        toast.success('Evento publicado e disponível para reservas.');
      } else {
        await cancelEvent(event.id);
        toast.success('Evento cancelado.');
      }
      router.refresh();
      return true;
    } catch {
      toast.error(
        kind === 'publish'
          ? 'Não foi possível publicar este evento.'
          : 'Não foi possível cancelar este evento.',
      );
      return false;
    } finally {
      setActionPending(false);
    }
  }

  async function confirmCancellation() {
    const cancelled = await transition('cancel');
    if (cancelled) {
      setCancelConfirmationOpen(false);
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Editar informações</CardTitle>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Os campos abaixo foram preenchidos com os dados atuais do evento.
            </p>
          </CardHeader>
          <CardContent>
            <form noValidate onSubmit={form.handleSubmit(save)} className="grid gap-5">
              <Field
                id="management-event-title"
                label="Título"
                error={form.formState.errors.title?.message}
              >
                <Input
                  id="management-event-title"
                  disabled={!canEdit}
                  aria-invalid={Boolean(form.formState.errors.title)}
                  aria-describedby={
                    form.formState.errors.title ? 'management-event-title-error' : undefined
                  }
                  {...form.register('title')}
                />
              </Field>
              <Field
                id="management-event-description"
                label="Descrição"
                error={form.formState.errors.description?.message}
              >
                <Textarea
                  id="management-event-description"
                  disabled={!canEdit}
                  aria-invalid={Boolean(form.formState.errors.description)}
                  aria-describedby={
                    form.formState.errors.description
                      ? 'management-event-description-error'
                      : undefined
                  }
                  {...form.register('description')}
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="management-event-venue"
                  label="Local"
                  error={form.formState.errors.venue?.message}
                >
                  <Input
                    id="management-event-venue"
                    disabled={!canEdit}
                    aria-invalid={Boolean(form.formState.errors.venue)}
                    aria-describedby={
                      form.formState.errors.venue ? 'management-event-venue-error' : undefined
                    }
                    {...form.register('venue')}
                  />
                </Field>
                <Field
                  id="management-event-starts-at"
                  label="Data e horário"
                  error={form.formState.errors.startsAt?.message}
                >
                  <Input
                    id="management-event-starts-at"
                    disabled={!canEdit}
                    type="datetime-local"
                    aria-invalid={Boolean(form.formState.errors.startsAt)}
                    aria-describedby={
                      form.formState.errors.startsAt
                        ? 'management-event-starts-at-error'
                        : undefined
                    }
                    {...form.register('startsAt')}
                  />
                </Field>
                <Field
                  id="management-event-price"
                  label="Preço (R$)"
                  error={form.formState.errors.price?.message}
                >
                  <Input
                    id="management-event-price"
                    disabled={!canEdit}
                    inputMode="decimal"
                    aria-invalid={Boolean(form.formState.errors.price)}
                    aria-describedby={
                      form.formState.errors.price ? 'management-event-price-error' : undefined
                    }
                    {...form.register('price')}
                  />
                </Field>
                <Field
                  id="management-event-image"
                  label="Imagem (URL)"
                  error={form.formState.errors.imageUrl?.message}
                >
                  <Input
                    id="management-event-image"
                    disabled={!canEdit}
                    type="url"
                    aria-invalid={Boolean(form.formState.errors.imageUrl)}
                    aria-describedby={
                      form.formState.errors.imageUrl ? 'management-event-image-error' : undefined
                    }
                    {...form.register('imageUrl')}
                  />
                </Field>
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting || !canEdit}>
                <Save className="size-4" />
                {form.formState.isSubmitting ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Publicação</CardTitle>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Capacidade configurada: {event.capacity} lugares
            </p>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button
              type="button"
              onClick={() => void transition('publish')}
              disabled={actionPending || !canPublish}
            >
              <Send className="size-4" />
              {event.status === 'PUBLISHED' ? 'Evento publicado' : 'Publicar evento'}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => setCancelConfirmationOpen(true)}
              disabled={actionPending || !canCancel}
            >
              <Ban className="size-4" />
              {event.status === 'CANCELLED' ? 'Evento cancelado' : 'Cancelar evento'}
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">{status.description}</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={cancelConfirmationOpen} onOpenChange={setCancelConfirmationOpen}>
        <DialogContent className="max-w-md">
          <div className="flex items-start gap-4 pr-8">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-danger/15 text-danger">
              <TriangleAlert aria-hidden="true" className="size-5" />
            </span>
            <div>
              <DialogTitle className="font-display text-xl font-semibold">
                Cancelar este evento?
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm leading-6 text-muted-foreground">
                Você está prestes a cancelar{' '}
                <strong className="text-foreground">{event.title}</strong>. Essa ação encerra a
                publicação e não poderá ser desfeita.
              </DialogDescription>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelConfirmationOpen(false)}
              disabled={actionPending}
            >
              Voltar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void confirmCancellation()}
              disabled={actionPending}
            >
              <Ban aria-hidden="true" className="size-4" />
              {actionPending ? 'Cancelando…' : 'Sim, cancelar evento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
