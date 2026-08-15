import type { TicketResponse } from '@app/shared';
import { TicketStatus } from '@app/shared';
import { Ban, CalendarDays, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Badge, Card } from '@/shared/ui';
import { QrView } from './qr-view';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

export function TicketCard({ ticket }: { ticket: TicketResponse }) {
  const valid = ticket.status === TicketStatus.VALID;
  const eventCancelled = ticket.status === TicketStatus.EVENT_CANCELLED;

  const content = (
    <Card
      className={`flex h-full gap-4 p-4 sm:p-5 ${
        eventCancelled ? '' : 'transition-colors group-hover:border-primary/60'
      }`}
    >
      {eventCancelled ? (
        <div className="flex size-24 shrink-0 self-center items-center justify-center rounded-lg border border-danger/30 bg-danger/10 text-danger">
          <Ban aria-hidden="true" className="size-9" />
        </div>
      ) : ticket.qrToken ? (
        <div className="shrink-0 self-center scale-[0.72] origin-left sm:scale-[0.82]">
          <QrView qrToken={ticket.qrToken} size={120} />
        </div>
      ) : null}
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-3">
          <h2
            className={`font-display text-lg font-semibold leading-tight ${
              eventCancelled ? '' : 'transition-colors group-hover:text-primary'
            }`}
          >
            {ticket.eventTitle}
          </h2>
          {!eventCancelled ? (
            <ChevronRight
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-muted-foreground"
            />
          ) : null}
        </div>
        <Badge variant={eventCancelled ? 'danger' : valid ? 'success' : 'warning'} className="mt-3">
          {eventCancelled ? 'Evento cancelado' : valid ? 'Válido' : 'Utilizado'}
        </Badge>
        {eventCancelled ? (
          <p className="mt-3 text-sm font-medium text-danger">
            O estorno do seu valor já foi solicitado.
          </p>
        ) : null}
        <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
          <div className="flex gap-2">
            <dt className="sr-only">Local</dt>
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-accent" />
            <dd>{ticket.venue}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="sr-only">Data</dt>
            <CalendarDays aria-hidden="true" className="size-4 shrink-0 text-primary" />
            <dd>{dateFormatter.format(new Date(ticket.startsAt))}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm font-semibold">Assento {ticket.seatLabel}</p>
      </div>
    </Card>
  );

  if (eventCancelled) {
    return content;
  }

  return (
    <Link
      href={`/my-tickets/${ticket.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      {content}
    </Link>
  );
}
