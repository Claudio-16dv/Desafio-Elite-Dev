import type { OrderListItem } from '@app/shared';
import { OrderStatus } from '@app/shared';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { OrderCard } from './order-card';

vi.mock('./cancel-order-dialog', () => ({
  CancelOrderDialog: () => <div data-testid="cancel-dialog" />,
}));

function makeOrder(overrides: Partial<OrderListItem> = {}): OrderListItem {
  return {
    id: 'order-1',
    eventId: 'event-1',
    eventTitle: 'Festival de Teste',
    seatLabels: ['A1'],
    totalCents: 4500,
    status: OrderStatus.PAID,
    createdAt: '2026-08-20T20:00:00.000Z',
    canCancel: false,
    ...overrides,
  };
}

describe('OrderCard', () => {
  it.each([
    [OrderStatus.PAID, 'Pago'],
    [OrderStatus.PENDING, 'Pendente'],
    [OrderStatus.EXPIRED, 'Expirado'],
    [OrderStatus.CANCELLED, 'Cancelado'],
    [OrderStatus.REFUSED, 'Recusado'],
    [OrderStatus.REFUND_REQUESTED, 'Estorno solicitado'],
  ] as const)('mostra o rótulo correto para o status %s', (status, label) => {
    render(<OrderCard order={makeOrder({ status })} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('mostra o diálogo de cancelamento quando o pedido pode ser cancelado', () => {
    render(<OrderCard order={makeOrder({ canCancel: true })} />);

    expect(screen.getByTestId('cancel-dialog')).toBeInTheDocument();
  });

  it('não mostra o diálogo quando o pedido não pode ser cancelado', () => {
    render(<OrderCard order={makeOrder({ canCancel: false })} />);

    expect(screen.queryByTestId('cancel-dialog')).not.toBeInTheDocument();
  });

  it('não mostra o diálogo para pedidos com estorno solicitado', () => {
    render(
      <OrderCard order={makeOrder({ canCancel: true, status: OrderStatus.REFUND_REQUESTED })} />,
    );

    expect(screen.queryByTestId('cancel-dialog')).not.toBeInTheDocument();
  });

  it('mostra o fallback quando o pedido não possui assentos', () => {
    render(<OrderCard order={makeOrder({ seatLabels: [] })} />);

    expect(screen.getByText('Assentos liberados')).toBeInTheDocument();
  });
});
