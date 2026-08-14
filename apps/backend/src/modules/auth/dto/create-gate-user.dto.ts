import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { CreateGateUserRequest } from '@app/shared';

export class CreateGateUserDto implements CreateGateUserRequest {
  @Transform(({ value }: { value: string }) => value.trim())
  @IsString()
  @MinLength(2)
  name!: string;

  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
