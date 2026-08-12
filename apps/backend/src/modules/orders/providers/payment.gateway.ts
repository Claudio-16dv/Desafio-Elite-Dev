export interface PaymentInput {
  amountCents: number;
  outcome: 'approve' | 'refuse';
}

export interface PaymentResult {
  approved: boolean;
}

export abstract class PaymentGateway {
  abstract charge(input: PaymentInput): Promise<PaymentResult>;
}
