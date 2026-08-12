import { IsNotEmpty, IsString, IsUUID, ValidateIf } from 'class-validator';
import { ValidateTicketRequest } from '@app/shared';

export class ValidateTicketDto implements ValidateTicketRequest {
  @IsUUID()
  eventId!: string;

  @ValidateIf((input: ValidateTicketDto) => !input.code)
  @IsString()
  @IsNotEmpty()
  token?: string;

  @ValidateIf((input: ValidateTicketDto) => !input.token)
  @IsString()
  @IsNotEmpty()
  code?: string;
}
