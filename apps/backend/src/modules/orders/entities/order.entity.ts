import { OrderStatus } from '@app/shared';
import { OrderNotPaidError } from '../errors/order-not-paid.error';
import { OrderNotPendingError } from '../errors/order-not-pending.error';

export class OrderEntity {
  constructor(
    readonly id: string,
    private status: OrderStatus,
  ) {}

  getStatus(): OrderStatus {
    return this.status;
  }

  markPaid(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new OrderNotPendingError();
    }
    this.status = OrderStatus.PAID;
  }

  markExpired(): void {
    if (this.status !== OrderStatus.PENDING) {
      throw new OrderNotPendingError();
    }
    this.status = OrderStatus.EXPIRED;
  }

  cancel(): void {
    if (this.status !== OrderStatus.PAID) {
      throw new OrderNotPaidError();
    }
    this.status = OrderStatus.CANCELLED;
  }
}
