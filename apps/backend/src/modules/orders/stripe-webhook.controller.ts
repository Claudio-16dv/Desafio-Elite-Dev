import { BadRequestException, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { HandleStripeWebhookUseCase } from './use-cases/handle-stripe-webhook.use-case';

type RawBodyRequest = Request & { rawBody?: Buffer };

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly handleWebhook: HandleStripeWebhookUseCase) {}

  @Post()
  @HttpCode(200)
  async handle(
    @Req() request: RawBodyRequest,
    @Headers('stripe-signature') signature?: string,
  ): Promise<{ received: true }> {
    if (!request.rawBody || !signature) {
      throw new BadRequestException('Assinatura Stripe inválida');
    }

    try {
      await this.handleWebhook.execute(request.rawBody, signature);
    } catch (error) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        throw new BadRequestException('Assinatura Stripe inválida');
      }
      throw error;
    }

    return { received: true };
  }
}
