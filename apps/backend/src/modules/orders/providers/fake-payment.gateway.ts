import { Injectable } from '@nestjs/common';
import {
  CreatePaymentInput,
  PaymentGateway,
  PaymentResult,
  PaymentWebhookEvent,
} from './payment.gateway';

@Injectable()
export class FakePaymentGateway extends PaymentGateway {
  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    return {
      paymentIntentId: `fake_payment_intent_${input.orderId}`,
      clientSecret: `fake_client_secret_${input.orderId}`,
    };
  }

  parseWebhookEvent(_rawBody: Buffer, _signature: string): PaymentWebhookEvent {
    return { type: 'ignored' };
  }
}
