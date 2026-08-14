import { Injectable } from '@nestjs/common';
import { AuthUser, LoginResponse, RegisterRequest } from '@app/shared';
import { EmailAlreadyUsedError } from '../errors/email-already-used.error';
import { PasswordHasher } from '../providers/password-hasher';
import { TokenProvider } from '../providers/token-provider';
import { UserRecord, UsersRepository } from '../repositories/users.repository';

@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokens: TokenProvider,
  ) {}

  async execute(input: RegisterRequest): Promise<LoginResponse> {
    const existingUser = await this.users.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyUsedError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.users.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    return {
      accessToken: await this.tokens.sign({ sub: user.id, role: user.role }),
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
