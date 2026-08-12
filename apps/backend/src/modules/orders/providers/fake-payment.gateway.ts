import { Injectable } from '@nestjs/common';
import { PaymentGateway, PaymentInput, PaymentResult } from './payment.gateway';

@Injectable()
export class FakePaymentGateway extends PaymentGateway {
  async charge(input: PaymentInput): Promise<PaymentResult> {
    return { approved: input.outcome !== 'refuse' };
  }
}
