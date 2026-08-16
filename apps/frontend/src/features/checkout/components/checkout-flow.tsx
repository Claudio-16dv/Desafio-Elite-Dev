'use client';

import type {
  CheckoutResponse,
  EventDetail,
  OrderResponse,
  ReservationResponse,
  SeatResponse,
} from '@app/shared';
import { OrderStatus } from '@app/shared';
import { CheckCircle2, Clock3, CreditCard, LoaderCircle, TicketX } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { checkOrderStatus, checkoutOrder, holdSeats, releaseReservation } from '../actions';
import { MAX_SEATS_PER_RESERVATION } from '../constants';
import { PaymentElementForm } from './payment-element-form';
import { SeatMap } from './seat-map';

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dateTime = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' });
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 40;

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function CheckoutFlow({ event, seats }: { event: EventDetail; seats: SeatResponse[] }) {
  const router = useRouter();
  const mountedRef = useRef(true);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [reservation, setReservation] = useState<ReservationResponse | null>(null);
  const [payment, setPayment] = useState<CheckoutResponse | null>(null);
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [creatingReservation, setCreatingReservation] = useState(false);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!reservation) {
      setRemainingSeconds(0);
      return;
    }

    const updateRemaining = () => {
      const expiresAt = new Date(reservation.expiresAt).getTime();
      setRemainingSeconds(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    };

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [reservation]);

  useEffect(() => {
    if (!reservation || polling || new Date(reservation.expiresAt).getTime() > Date.now()) {
      return;
    }

    setReservation(null);
    setPayment(null);
    setSelectedSeatIds([]);
    toast.error('A reserva expirou. Escolha os assentos novamente.');
    router.refresh();
  }, [polling, reservation, router, remainingSeconds]);

  function clearReservationState() {
    setReservation(null);
    setPayment(null);
    setSelectedSeatIds([]);
  }

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

    setCreatingReservation(true);
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
      setCreatingReservation(false);
    }
  }

  async function cancelReservation() {
    if (!reservation || payment) {
      return;
    }

    setCreatingReservation(true);
    try {
      await releaseReservation({ reservationId: reservation.id });
      clearReservationState();
      router.refresh();
      toast.success('Reserva liberada. Você pode escolher outros lugares.');
    } catch {
      toast.error('Não foi possível liberar a reserva. Tente novamente.');
    } finally {
      setCreatingReservation(false);
    }
  }

  async function createPaymentIntent() {
    if (!reservation || payment) {
      return;
    }

    setCreatingPayment(true);
    try {
      const createdPayment = await checkoutOrder({ reservationId: reservation.id });
      setPayment(createdPayment);
      toast.success('Pagamento pronto. Escolha cartão ou Pix para continuar.');
    } catch {
      clearReservationState();
      router.refresh();
      toast.error('Não foi possível iniciar o pagamento. A reserva foi liberada.');
    } finally {
      setCreatingPayment(false);
    }
  }

  const pollOrder = useCallback(
    async (orderId: string) => {
      if (!mountedRef.current) {
        return;
      }

      setPolling(true);
      try {
        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
          const currentOrder = await checkOrderStatus({ orderId });
          if (!mountedRef.current) {
            return;
          }

          if (currentOrder.status === OrderStatus.PAID) {
            setOrder(currentOrder);
            clearReservationState();
            toast.success('Pagamento aprovado! Seus ingressos já estão disponíveis.');
            return;
          }

          if (
            currentOrder.status === OrderStatus.EXPIRED ||
            currentOrder.status === OrderStatus.CANCELLED ||
            currentOrder.status === OrderStatus.REFUSED
          ) {
            setOrder(currentOrder);
            clearReservationState();
            router.refresh();
            toast.error('O pagamento não foi concluído dentro do prazo da reserva.');
            return;
          }

          await wait(POLL_INTERVAL_MS);
        }

        toast.error('O pagamento ainda está sendo processado. Atualize os pedidos em instantes.');
      } catch {
        if (mountedRef.current) {
          toast.error('Não foi possível consultar o status do pagamento. Tente novamente.');
        }
      } finally {
        if (mountedRef.current) {
          setPolling(false);
        }
      }
    },
    [router],
  );

  const selectedSeats = seats.filter((seat) => selectedSeatIds.includes(seat.id));
  const total = selectedSeats.length * event.priceCents;
  const busy = creatingReservation || creatingPayment || confirmingPayment || polling;

  if (order) {
    const paid = order.status === OrderStatus.PAID;
    const expired = order.status === OrderStatus.EXPIRED;
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div
            className={`mb-2 flex size-12 items-center justify-center rounded-full ${paid ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'}`}
          >
            {paid ? <CheckCircle2 className="size-7" /> : <TicketX className="size-7" />}
          </div>
          <CardTitle>
            {paid
              ? 'Pagamento confirmado'
              : expired
                ? 'Reserva expirada'
                : 'Pagamento não concluído'}
          </CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            {paid
              ? `${order.tickets.length} ingresso${order.tickets.length === 1 ? '' : 's'} emitido${order.tickets.length === 1 ? '' : 's'} para ${event.title}.`
              : expired
                ? 'O prazo da reserva terminou e os assentos foram liberados.'
                : 'O pedido não foi concluído. Você pode escolher outros assentos.'}
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
                clearReservationState();
                router.refresh();
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <SeatMap
        seats={seats}
        selectedIds={selectedSeatIds}
        onToggle={toggleSeat}
        disabled={Boolean(reservation) || busy}
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
            <div className="rounded-[--radius] border border-warning/30 bg-warning/10 p-4 text-sm">
              <p className="flex items-center justify-between gap-2 font-semibold text-warning">
                <span className="flex items-center gap-2">
                  <Clock3 aria-hidden="true" className="size-4" /> Reserva temporária ativa
                </span>
                <span aria-live="polite" aria-label="Tempo restante da reserva">
                  {formatRemaining(remainingSeconds)}
                </span>
              </p>
              <p className="mt-2 text-muted-foreground">
                Assentos: {reservation.seatLabels.join(', ')}. Pague até{' '}
                {dateTime.format(new Date(reservation.expiresAt))}.
              </p>
            </div>
          ) : null}
          {payment ? (
            <div className="rounded-[--radius] border border-primary/30 bg-primary/5 p-4">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <CreditCard aria-hidden="true" className="size-4 text-primary" />
                Pagamento seguro
              </p>
              <PaymentElementForm
                clientSecret={payment.clientSecret}
                disabled={polling}
                onConfirmed={() => void pollOrder(payment.orderId)}
                onError={(message) => toast.error(message)}
                onSubmittingChange={setConfirmingPayment}
              />
            </div>
          ) : null}
          {polling ? (
            <div
              aria-live="polite"
              className="flex items-center gap-3 rounded-[--radius] border border-primary/30 bg-primary/5 p-4 text-sm font-medium"
              role="status"
            >
              <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
              Processando pagamento…
            </div>
          ) : null}
          {!reservation ? (
            <Button
              className="w-full"
              onClick={createReservation}
              disabled={busy || !selectedSeatIds.length}
              aria-busy={creatingReservation}
            >
              {creatingReservation ? (
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
                />
              ) : null}
              {creatingReservation ? 'Reservando…' : 'Reservar assentos'}
            </Button>
          ) : !payment ? (
            <div className="grid gap-3">
              <Button
                className="w-full"
                onClick={createPaymentIntent}
                disabled={busy}
                aria-busy={creatingPayment}
              >
                {creatingPayment ? (
                  <span
                    aria-hidden="true"
                    className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin"
                  />
                ) : null}
                {creatingPayment ? 'Preparando pagamento…' : 'Pagar'}
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={cancelReservation}
                disabled={busy}
              >
                Liberar reserva
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
