import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { CheckoutRequest } from '@app/shared';

export class CheckoutDto implements CheckoutRequest {
  @IsUUID()
  reservationId!: string;

  @IsOptional()
  @IsIn(['approve', 'refuse'])
  simulateOutcome?: 'approve' | 'refuse';
}
