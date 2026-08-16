import { Injectable } from '@nestjs/common';
import { PaymentGateway } from '../providers/payment.gateway';
import { OrdersRepository } from '../repositories/orders.repository';

@Injectable()
export class HandleStripeWebhookUseCase {
  constructor(
    private readonly payments: PaymentGateway,
    private readonly orders: OrdersRepository,
  ) {}

  async execute(rawBody: Buffer, signature: string): Promise<void> {
    const event = this.payments.parseWebhookEvent(rawBody, signature);
    if (event.type === 'ignored') {
      return;
    }

    const order = await this.orders.findByPaymentIntentId(event.paymentIntentId);
    if (!order) {
      return;
    }

    if (event.type === 'succeeded') {
      await this.orders.confirmPaidAndIssueTickets(event.paymentIntentId, new Date());
      return;
    }

    await this.orders.expireOrder(order.id);
  }
}
