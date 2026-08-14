import { Injectable } from '@nestjs/common';
import { AuthUser, UpdateProfileRequest } from '@app/shared';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error';
import { PasswordHasher } from '../providers/password-hasher';
import { UpdateUserInput, UsersRepository } from '../repositories/users.repository';

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly users: UsersRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(userId: string, input: UpdateProfileRequest): Promise<AuthUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new DomainException('Usuário não encontrado', 'USER_NOT_FOUND', 404);
    }

    const update: UpdateUserInput = {};

    if (input.name !== undefined) {
      update.name = input.name.trim();
    }

    if (input.newPassword) {
      if (!input.currentPassword) {
        throw new InvalidCredentialsError();
      }

      const passwordMatches = await this.passwordHasher.compare(
        input.currentPassword,
        user.passwordHash,
      );
      if (!passwordMatches) {
        throw new InvalidCredentialsError();
      }

      update.passwordHash = await this.passwordHasher.hash(input.newPassword);
    }

    if (!update.name && !update.passwordHash) {
      throw new DomainException('Informe ao menos uma alteração', 'PROFILE_UPDATE_EMPTY', 400);
    }

    const updated = await this.users.update(userId, update);
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    };
  }
}
