'use client';

import type { EventDetail, OrderResponse, ReservationResponse, SeatResponse } from '@app/shared';
import { OrderStatus } from '@app/shared';
import { CheckCircle2, Clock3, Copy, CreditCard, ShieldCheck, TicketX } from 'lucide-react';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/shared/ui';
import { checkoutOrder, holdSeats, releaseReservation } from '../actions';
import { MAX_SEATS_PER_RESERVATION } from '../constants';
import { SeatMap } from './seat-map';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function buildPixPayload(reservationId: string, totalCents: number) {
  return 'PIX-SIM|res:' + reservationId + '|amount:' + totalCents;
}

export function CheckoutFlow({ event, seats }: { event: EventDetail; seats: SeatResponse[] }) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [reservation, setReservation] = useState<ReservationResponse | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [pending, setPending] = useState(false);

  function toggleSeat(seatId: string) {
    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds((current) => current.filter((id) => id !== seatId));
      return;
    }

    if (selectedSeatIds.length >= MAX_SEATS_PER_RESERVATION) {
      toast.error(
        `Você pode escolher até ${MAX_SEATS_PER_RESERVATION} assentos. Desmarque um para selecionar outro.`,
      );
      return;
    }

    setSelectedSeatIds((current) => [...current, seatId]);
  }

  async function createReservation() {
    if (!selectedSeatIds.length) {
      toast.error('Selecione ao menos um assento antes de continuar.');
      return;
    }

    setPending(true);
    try {
      const createdReservation = await holdSeats({ eventId: event.id, seatIds: selectedSeatIds });
      setReservation(createdReservation);
      toast.success(
        `Assentos ${createdReservation.seatLabels.join(', ')} reservados temporariamente.`,
      );
    } catch {
      toast.error(
        'Não foi possível reservar estes assentos. Eles podem ter acabado de ser ocupados.',
      );
    } finally {
      setPending(false);
    }
  }

  async function cancelReservation() {
    if (!reservation) {
      return;
    }

    setPending(true);
    try {
      await releaseReservation({ reservationId: reservation.id });
      setReservation(null);
      setSelectedSeatIds([]);
      toast.success('Reserva liberada. Você pode escolher outros lugares.');
    } catch {
      toast.error('Não foi possível liberar a reserva. Tente novamente.');
    } finally {
      setPending(false);
    }
  }

  async function pay(simulateOutcome: 'approve' | 'refuse') {
    if (!reservation) {
      return;
    }

    setPending(true);
    try {
      const createdOrder = await checkoutOrder({ reservationId: reservation.id, simulateOutcome });
      setOrder(createdOrder);
      if (createdOrder.status === OrderStatus.PAID) {
        toast.success('Pagamento aprovado! Seus ingressos já estão disponíveis.');
      } else {
        toast.error('Pagamento recusado. A reserva foi liberada para outros clientes.');
      }
    } catch {
      toast.error('Não foi possível processar o pagamento. Verifique a reserva e tente novamente.');
    } finally {
      setPending(false);
    }
  }

  const selectedSeats = seats.filter((seat) => selectedSeatIds.includes(seat.id));
  const total = selectedSeats.length * event.priceCents;
  const pixPayload = reservation ? buildPixPayload(reservation.id, total) : '';

  if (order) {
    const paid = order.status === OrderStatus.PAID;
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div
            className={`mb-2 flex size-12 items-center justify-center rounded-full ${paid ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}
          >
            {paid ? <CheckCircle2 className="size-7" /> : <TicketX className="size-7" />}
          </div>
          <CardTitle>{paid ? 'Pagamento confirmado' : 'Pagamento recusado'}</CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            {paid
              ? `${order.tickets.length} ingresso${order.tickets.length === 1 ? '' : 's'} emitido${order.tickets.length === 1 ? '' : 's'} para ${event.title}.`
              : 'Os assentos foram liberados. Você pode tentar novamente com outra forma de pagamento simulada.'}
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {paid ? (
            <Button asChild>
              <Link href="/my-tickets">Ver meus ingressos</Link>
            </Button>
          ) : (
            <Button
              onClick={() => {
                setOrder(null);
                setReservation(null);
                setSelectedSeatIds([]);
              }}
            >
              Escolher outros assentos
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={`/events/${event.id}`}>Voltar ao evento</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
      <SeatMap
        seats={seats}
        selectedIds={selectedSeatIds}
        onToggle={toggleSeat}
        disabled={Boolean(reservation) || pending}
      />
      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Resumo da reserva</CardTitle>
          <p className="text-sm text-muted-foreground">{event.title}</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Assentos</span>
              <span className="text-right font-medium">
                {selectedSeats.length
                  ? selectedSeats.map((seat) => seat.label).join(', ')
                  : 'Nenhum selecionado'}
              </span>
            </div>
            <div className="flex justify-between gap-3 border-t border-border pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{money.format(total / 100)}</span>
            </div>
          </div>
          {reservation ? (
            <>
              <div className="rounded-[--radius] border border-warning/30 bg-warning/10 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold text-warning">
                  <Clock3 className="size-4" /> Reserva temporária ativa
                </p>
                <p className="mt-2 text-muted-foreground">
                  Assentos: {reservation.seatLabels.join(', ')}. Conclua o pagamento antes de{' '}
                  {new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(
                    new Date(reservation.expiresAt),
                  )}
                  .
                </p>
              </div>
              <div className="rounded-[--radius] border border-primary/30 bg-primary/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="size-4 text-primary" /> Pix simulado
                </p>
                <div className="mx-auto mt-4 w-fit rounded-lg bg-white p-2">
                  <QRCodeCanvas value={pixPayload} size={156} includeMargin />
                </div>
                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                  Pagamento simulado — nenhuma cobrança real será realizada.
                </p>
                <div className="mt-3 flex gap-2">
                  <Input
                    aria-label="Código Pix copia e cola simulado"
                    readOnly
                    value={pixPayload}
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label="Copiar código Pix"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(pixPayload);
                        toast.success('Código Pix simulado copiado.');
                      } catch {
                        toast.error('Não foi possível copiar o código.');
                      }
                    }}
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : null}
          {!reservation ? (
            <Button
              className="w-full"
              onClick={createReservation}
              disabled={pending || !selectedSeatIds.length}
            >
              Reservar assentos
            </Button>
          ) : (
            <div className="grid gap-3">
              <Button className="w-full" onClick={() => pay('approve')} disabled={pending}>
                <CreditCard className="size-4" /> Já paguei / Confirmar
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => pay('refuse')}
                disabled={pending}
              >
                Simular recusa
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={cancelReservation}
                disabled={pending}
              >
                Liberar reserva
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
