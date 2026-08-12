import { OrderStatus } from '@app/shared';
import { OrderNotPaidError } from '../errors/order-not-paid.error';

export class OrderEntity {
  constructor(
    readonly id: string,
    private status: OrderStatus,
  ) {}

  getStatus(): OrderStatus {
    return this.status;
  }

  cancel(): void {
    if (this.status !== OrderStatus.PAID) {
      throw new OrderNotPaidError();
    }
    this.status = OrderStatus.CANCELLED;
  }
}
