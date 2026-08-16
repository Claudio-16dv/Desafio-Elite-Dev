import { Injectable } from '@nestjs/common';
import { AuthUser, CreateGateUserRequest, Role } from '@app/shared';
import { EmailAlreadyUsedError } from '../errors/email-already-used.error';
import { PasswordHasher } from '../providers/password-hasher';
import { UserRecord, UsersRepository } from '../repositories/users.repository';

@Injectable()
export class CreateGateUserUseCase {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(organizerId: string, input: CreateGateUserRequest): Promise<AuthUser> {
    const existingUser = await this.users.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyUsedError();
    }

    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.users.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: Role.GATE,
      organizerId,
    });

    return this.toAuthUser(user);
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
