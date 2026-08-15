import type { EventDetail } from '@app/shared';
import { CalendarDays, MapPin, Ticket, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Container } from '@/shared/ui';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'full',
  timeStyle: 'short',
});

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function EventDetailView({
  event,
  reservationHref,
  reservationLabel,
}: {
  event: EventDetail;
  reservationHref: string;
  reservationLabel: string;
}) {
  const startsAt = new Date(event.date);

  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <article>
          <div className="mb-8 overflow-hidden rounded-[--radius] border border-border bg-[radial-gradient(circle_at_top_right,_rgba(236,72,153,0.34),_transparent_36%),linear-gradient(135deg,_rgba(139,92,246,0.6),_rgba(20,20,27,0.98)_62%)] p-7 sm:p-10">
            <Badge className="border-white/20 bg-black/25 text-white">Experiência ao vivo</Badge>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75">
              {event.description ??
                'Prepare-se para uma experiência única, cuidadosamente selecionada para viver ao vivo.'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoItem
              icon={CalendarDays}
              label="Quando"
              value={
                Number.isNaN(startsAt.valueOf())
                  ? 'Data a confirmar'
                  : dateFormatter.format(startsAt)
              }
            />
            <InfoItem icon={MapPin} label="Onde" value={event.venue} />
            <InfoItem
              icon={Ticket}
              label="Ingresso"
              value={currencyFormatter.format(event.priceCents / 100)}
            />
            <InfoItem
              icon={Users}
              label="Disponibilidade"
              value={`${event.available} de ${event.capacity} lugares disponíveis`}
            />
          </div>
        </article>
        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Garanta seu lugar</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Os assentos ficam reservados temporariamente durante o pagamento.
            </p>
          </CardHeader>
          <CardContent>
            {event.available === 0 ? (
              <Button type="button" className="w-full" disabled>
                Esgotado
              </Button>
            ) : (
              <Button asChild className="w-full">
                <Link href={reservationHref}>{reservationLabel}</Link>
              </Button>
            )}
            <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">
              Pagamento simulado e emissão segura de ingresso com QR assinado.
            </p>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[--radius] border border-border bg-card/60 p-4">
      <Icon aria-hidden="true" className="mb-3 size-5 text-primary" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}
