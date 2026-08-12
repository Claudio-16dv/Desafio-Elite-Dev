import { ArrayNotEmpty, ArrayUnique, IsArray, IsUUID } from 'class-validator';
import { CreateReservationRequest } from '@app/shared';

export class CreateReservationDto implements CreateReservationRequest {
  @IsUUID()
  eventId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  seatIds!: string[];
}
