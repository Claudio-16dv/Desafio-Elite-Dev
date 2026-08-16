import { IsUUID } from 'class-validator';
import { CheckoutRequest } from '@app/shared';

export class CheckoutDto implements CheckoutRequest {
  @IsUUID()
  reservationId!: string;
}
