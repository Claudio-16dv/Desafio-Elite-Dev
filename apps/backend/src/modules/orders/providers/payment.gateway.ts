export interface CreatePaymentInput {
  amountCents: number;
  orderId: string;
}

export interface PaymentResult {
  paymentIntentId: string;
  clientSecret: string;
}

export type PaymentWebhookEvent =
  | { type: 'succeeded'; paymentIntentId: string }
  | { type: 'canceled'; paymentIntentId: string }
  | { type: 'ignored' };

export abstract class PaymentGateway {
  abstract createPayment(input: CreatePaymentInput): Promise<PaymentResult>;
  abstract parseWebhookEvent(rawBody: Buffer, signature: string): PaymentWebhookEvent;
}
