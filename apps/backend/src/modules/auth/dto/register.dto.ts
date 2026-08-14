import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';
import { RegisterRequest, Role } from '@app/shared';

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

  @IsIn([Role.CLIENT, Role.ORGANIZER])
  role!: Role.CLIENT | Role.ORGANIZER;
}
