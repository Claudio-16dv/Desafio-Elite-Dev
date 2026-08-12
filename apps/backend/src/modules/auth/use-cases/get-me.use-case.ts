import { Injectable } from '@nestjs/common';
import { AuthUser } from '@app/shared';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { UsersRepository } from '../repositories/users.repository';

@Injectable()
export class GetMeUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(userId: string): Promise<AuthUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new DomainException('Usuário não encontrado', 'USER_NOT_FOUND', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
