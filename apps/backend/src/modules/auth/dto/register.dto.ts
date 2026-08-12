import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { RegisterRequest } from '@app/shared';

export class RegisterDto implements RegisterRequest {
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
