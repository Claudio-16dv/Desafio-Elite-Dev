import type { TicketResponse } from '@app/shared';
import { TicketStatus } from '@app/shared';
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Badge, Card } from '@/shared/ui';
import { QrView } from './qr-view';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' });

export function TicketCard({ ticket }: { ticket: TicketResponse }) {
  const valid = ticket.status === TicketStatus.VALID;

  return (
    <Link
      href={`/my-tickets/${ticket.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <Card className="flex h-full gap-4 p-4 transition-colors group-hover:border-primary/60 sm:p-5">
        <div className="shrink-0 self-center scale-[0.72] origin-left sm:scale-[0.82]">
          <QrView qrToken={ticket.qrToken} size={120} />
        </div>
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
              {ticket.eventTitle}
            </h2>
            <ChevronRight
              aria-hidden="true"
              className="mt-1 size-5 shrink-0 text-muted-foreground"
            />
          </div>
          <Badge variant={valid ? 'success' : 'warning'} className="mt-3">
            {valid ? 'Válido' : 'Utilizado'}
          </Badge>
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
    </Link>
  );
}
