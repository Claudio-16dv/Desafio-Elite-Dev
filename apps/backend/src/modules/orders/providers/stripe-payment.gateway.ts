import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  CreatePaymentInput,
  PaymentGateway,
  PaymentResult,
  PaymentWebhookEvent,
} from './payment.gateway';

@Injectable()
export class StripePaymentGateway extends PaymentGateway {
  private readonly stripe: Stripe;

  constructor(private readonly config: ConfigService) {
    super();
    this.stripe = new Stripe(this.config.getOrThrow<string>('stripe.secretKey'));
  }

  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: 'brl',
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: input.orderId },
    });

    if (!paymentIntent.client_secret) {
      throw new Error('Stripe PaymentIntent não retornou client secret.');
    }

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  parseWebhookEvent(rawBody: Buffer, signature: string): PaymentWebhookEvent {
    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      this.config.getOrThrow<string>('stripe.webhookSecret'),
    );

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      return { type: 'succeeded', paymentIntentId: paymentIntent.id };
    }

    if (event.type === 'payment_intent.canceled') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      return { type: 'canceled', paymentIntentId: paymentIntent.id };
    }

    return { type: 'ignored' };
  }
}
