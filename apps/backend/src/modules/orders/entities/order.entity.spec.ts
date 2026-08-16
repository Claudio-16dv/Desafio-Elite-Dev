import { OrderStatus } from '@app/shared';
import { OrderNotPaidError } from '../errors/order-not-paid.error';
import { OrderNotPendingError } from '../errors/order-not-pending.error';
import { OrderEntity } from './order.entity';

describe('OrderEntity', () => {
  const orderId = 'order-id';
  const nonPendingStatuses = [
    OrderStatus.PAID,
    OrderStatus.EXPIRED,
    OrderStatus.REFUND_REQUESTED,
    OrderStatus.REFUSED,
    OrderStatus.CANCELLED,
  ];
  const nonPaidStatuses = [
    OrderStatus.PENDING,
    OrderStatus.EXPIRED,
    OrderStatus.REFUND_REQUESTED,
    OrderStatus.REFUSED,
    OrderStatus.CANCELLED,
  ];

  it('transiciona de PENDING para PAID', () => {
    const order = new OrderEntity(orderId, OrderStatus.PENDING);

    order.markPaid();

    expect(order.getStatus()).toBe(OrderStatus.PAID);
  });

  it.each(nonPendingStatuses)('rejeita markPaid a partir de %s', (status) => {
    const order = new OrderEntity(orderId, status);

    expect(() => order.markPaid()).toThrow(OrderNotPendingError);
    expect(order.getStatus()).toBe(status);
  });

  it('transiciona de PENDING para EXPIRED', () => {
    const order = new OrderEntity(orderId, OrderStatus.PENDING);

    order.markExpired();

    expect(order.getStatus()).toBe(OrderStatus.EXPIRED);
  });

  it.each(nonPendingStatuses)('rejeita markExpired a partir de %s', (status) => {
    const order = new OrderEntity(orderId, status);

    expect(() => order.markExpired()).toThrow(OrderNotPendingError);
    expect(order.getStatus()).toBe(status);
  });

  it('transiciona de PAID para CANCELLED', () => {
    const order = new OrderEntity(orderId, OrderStatus.PAID);

    order.cancel();

    expect(order.getStatus()).toBe(OrderStatus.CANCELLED);
  });

  it.each(nonPaidStatuses)('rejeita cancel a partir de %s', (status) => {
    const order = new OrderEntity(orderId, status);

    expect(() => order.cancel()).toThrow(OrderNotPaidError);
    expect(order.getStatus()).toBe(status);
  });
});
