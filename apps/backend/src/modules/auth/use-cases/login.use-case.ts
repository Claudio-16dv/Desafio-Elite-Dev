import { Injectable } from '@nestjs/common';
import { AuthUser, LoginRequest, LoginResponse } from '@app/shared';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { PasswordHasher } from '../providers/password-hasher';
import { TokenProvider } from '../providers/token-provider';
import { UserRecord, UsersRepository } from '../repositories/users.repository';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenProvider,
  ) {}

  async execute(input: LoginRequest): Promise<LoginResponse> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const passwordMatches = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new InvalidCredentialsError();
    }

    return this.toLoginResponse(user);
  }

  private async toLoginResponse(user: UserRecord): Promise<LoginResponse> {
    return {
      accessToken: await this.tokens.sign({
        sub: user.id,
        role: user.role,
        organizerId: user.organizerId ?? undefined,
      }),
      user: this.toAuthUser(user),
    };
  }

  private toAuthUser(user: UserRecord): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
