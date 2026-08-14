import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { BcryptPasswordHasher } from './providers/bcrypt-password-hasher';
import { JwtTokenProvider } from './providers/jwt-token-provider';
import { PasswordHasher } from './providers/password-hasher';
import { TokenProvider } from './providers/token-provider';
import { PrismaUsersRepository } from './repositories/prisma-users.repository';
import { UsersRepository } from './repositories/users.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CreateGateUserUseCase } from './use-cases/create-gate-user.use-case';
import { GetMeUseCase } from './use-cases/get-me.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';

type JwtExpiresIn = `${number}${'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y'}`;

function getJwtExpiresIn(): JwtExpiresIn {
  return (process.env.JWT_EXPIRES_IN ?? '1d') as JwtExpiresIn;
}

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET!,
        signOptions: { expiresIn: getJwtExpiresIn() },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    LoginUseCase,
    RegisterUseCase,
    GetMeUseCase,
    UpdateProfileUseCase,
    CreateGateUserUseCase,
    JwtStrategy,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: TokenProvider, useClass: JwtTokenProvider },
  ],
})
export class AuthModule {}
