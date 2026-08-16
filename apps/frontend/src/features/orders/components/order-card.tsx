import type { OrderListItem } from '@app/shared';
import { OrderStatus } from '@app/shared';
import { CalendarClock, MapPin, ReceiptText } from 'lucide-react';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/shared/ui';
import { CancelOrderDialog } from './cancel-order-dialog';

const money = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const date = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const statusPresentation = {
  [OrderStatus.PENDING]: { label: 'Pendente', variant: 'warning' as const },
  [OrderStatus.PAID]: { label: 'Pago', variant: 'success' as const },
  [OrderStatus.REFUSED]: { label: 'Recusado', variant: 'danger' as const },
  [OrderStatus.CANCELLED]: { label: 'Cancelado', variant: 'muted' as const },
  [OrderStatus.EXPIRED]: { label: 'Expirado', variant: 'muted' as const },
  [OrderStatus.REFUND_REQUESTED]: { label: 'Estorno solicitado', variant: 'warning' as const },
};

export function OrderCard({ order }: { order: OrderListItem }) {
  const status = statusPresentation[order.status];

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <Badge variant={status.variant}>{status.label}</Badge>
          <CardTitle className="mt-3">{order.eventTitle}</CardTitle>
        </div>
        <ReceiptText aria-hidden="true" className="size-6 shrink-0 text-primary" />
      </CardHeader>
      <CardContent className="grid gap-4">
        <dl className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarClock aria-hidden="true" className="size-4 text-accent" />
            <dt className="sr-only">Criado em</dt>
            <dd>{date.format(new Date(order.createdAt))}</dd>
          </div>
          <div className="flex items-start gap-2">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 text-primary" />
            <dt className="sr-only">Assentos</dt>
            <dd>
              {order.seatLabels.length
                ? 'Assentos ' + order.seatLabels.join(', ')
                : 'Assentos liberados'}
            </dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-lg font-semibold">
            {money.format(order.totalCents / 100)}
          </p>
          {order.canCancel && order.status !== OrderStatus.REFUND_REQUESTED ? (
            <CancelOrderDialog orderId={order.id} />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
