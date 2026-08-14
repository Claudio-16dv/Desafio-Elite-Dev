'use client';

import type { OrganizerEventSummary } from '@app/shared';
import type { LucideIcon } from 'lucide-react';
import { CalendarPlus, CircleOff, Clapperboard, FilePenLine, Radio } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Button,
  Card,
  Container,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  EmptyState,
  PageHeader,
} from '@/shared/ui';
import { EventCreateDialog } from './event-create-dialog';
import { EventManagementPanel } from './event-management-panel';
import { OrganizerEventCard } from './organizer-event-card';

export function OrganizerDashboard({
  organizerName,
  events,
  total,
}: {
  organizerName: string;
  events: OrganizerEventSummary[];
  total: number;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const editingEvent = events.find((event) => event.id === editingEventId) ?? null;
  const published = events.filter((event) => event.status === 'PUBLISHED').length;
  const drafts = events.filter((event) => event.status === 'DRAFT').length;
  const cancelled = events.filter((event) => event.status === 'CANCELLED').length;

  function closeManagement(open: boolean) {
    if (!open) {
      setEditingEventId(null);
      router.refresh();
    }
  }

  return (
    <>
      <Container className="py-10 sm:py-14">
        <PageHeader
          eyebrow="Organização"
          title={`Olá, ${organizerName}`}
          description="Gerencie seus eventos, revise informações e controle o que está publicado."
          actions={
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <CalendarPlus aria-hidden="true" className="size-4" />
              Novo evento
            </Button>
          }
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={Clapperboard} label="Todos os eventos" value={total} />
          <SummaryCard icon={Radio} label="Publicados" value={published} tone="text-success" />
          <SummaryCard icon={FilePenLine} label="Rascunhos" value={drafts} tone="text-warning" />
          <SummaryCard icon={CircleOff} label="Cancelados" value={cancelled} tone="text-danger" />
        </div>

        <section className="mt-10">
          <div>
            <h2 className="font-display text-2xl font-semibold">Seus eventos</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Selecione um evento para editar os dados e controlar sua publicação sem sair do
              painel.
            </p>
          </div>

          {events.length ? (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {events.map((event) => (
                <OrganizerEventCard
                  key={event.id}
                  event={event}
                  onManage={() => setEditingEventId(event.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              className="mt-5"
              icon={Clapperboard}
              title="Você ainda não criou eventos"
              description="Crie seu primeiro evento para começar a configurar a experiência."
              action={
                <Button type="button" onClick={() => setCreateOpen(true)}>
                  Criar evento
                </Button>
              }
            />
          )}
        </section>
      </Container>

      <EventCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <Dialog open={Boolean(editingEvent)} onOpenChange={closeManagement}>
        <DialogContent className="max-h-[calc(100svh-2rem)] max-w-6xl overflow-y-auto p-0">
          {editingEvent ? (
            <>
              <div className="sticky top-0 z-20 border-b border-border bg-card/95 p-6 pr-14 backdrop-blur-xl">
                <DialogTitle className="font-display text-2xl font-semibold">
                  {editingEvent.title}
                </DialogTitle>
                <DialogDescription className="mt-2 text-sm text-muted-foreground">
                  Edite as informações e controle a publicação deste evento.
                </DialogDescription>
              </div>
              <div className="p-6">
                <EventManagementPanel event={editingEvent} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = 'text-primary',
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
        <Icon aria-hidden="true" className={`size-5 ${tone}`} />
      </span>
      <span>
        <span className="block font-display text-2xl font-semibold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </span>
    </Card>
  );
}
