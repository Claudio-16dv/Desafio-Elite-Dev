import type { TicketResponse } from '@app/shared';
import { TicketStatus } from '@app/shared';
import { Ban, CalendarDays, MapPin, ScanLine } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, CardTitle, Container } from '@/shared/ui';
import { QrView } from './qr-view';
import { TicketShareButton } from './ticket-share-button';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full', timeStyle: 'short' });

export function TicketDetailView({
  ticket,
  shared = false,
}: {
  ticket: TicketResponse;
  shared?: boolean;
}) {
  const valid = ticket.status === TicketStatus.VALID;
  const eventCancelled = ticket.status === TicketStatus.EVENT_CANCELLED;

  return (
    <Container className="py-10 sm:py-14">
      <div
        className={`mx-auto grid max-w-4xl gap-6 ${
          eventCancelled ? '' : 'lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start'
        }`}
      >
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border bg-[radial-gradient(circle_at_top_right,_rgba(236,72,153,0.24),_transparent_36%),linear-gradient(135deg,_rgba(139,92,246,0.3),_rgba(20,20,27,0.9))]">
            <Badge
              variant={eventCancelled ? 'danger' : valid ? 'success' : 'warning'}
              className="w-fit"
            >
              {eventCancelled
                ? 'Evento cancelado'
                : valid
                  ? 'Ingresso válido'
                  : 'Ingresso utilizado'}
            </Badge>
            <CardTitle className="mt-4 text-3xl">{ticket.eventTitle}</CardTitle>
            {!eventCancelled && ticket.code ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Código manual:{' '}
                <span className="font-mono font-semibold text-foreground">{ticket.code}</span>
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="grid gap-5 pt-6 text-sm">
            {eventCancelled ? (
              <div
                role="status"
                className="flex gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-danger"
              >
                <Ban aria-hidden="true" className="size-5 shrink-0" />
                <div>
                  <p className="font-semibold">Evento cancelado</p>
                  <p className="mt-1">O estorno do seu valor já foi solicitado.</p>
                </div>
              </div>
            ) : null}
            <p className="flex gap-3 text-muted-foreground">
              <MapPin aria-hidden="true" className="size-5 shrink-0 text-accent" />
              <span>{ticket.venue}</span>
            </p>
            <p className="flex gap-3 text-muted-foreground">
              <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-primary" />
              <span>{dateFormatter.format(new Date(ticket.startsAt))}</span>
            </p>
            <p className="flex gap-3 text-foreground">
              <ScanLine aria-hidden="true" className="size-5 shrink-0 text-success" />
              <span>
                Assento <strong>{ticket.seatLabel}</strong>
              </span>
            </p>
          </CardContent>
        </Card>
        {!eventCancelled && ticket.qrToken ? (
          <aside className="space-y-5">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apresente na entrada</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <QrView qrToken={ticket.qrToken} />
              </CardContent>
            </Card>
            {!shared ? <TicketShareButton ticketId={ticket.id} /> : null}
          </aside>
        ) : null}
      </div>
    </Container>
  );
}
