import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequest } from '@app/shared';

export class LoginDto implements LoginRequest {
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
