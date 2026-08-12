import { Injectable } from '@nestjs/common';
import { Prisma, Role as PrismaRole, User } from '@prisma/client';
import { Role } from '@app/shared';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { EmailAlreadyUsedError } from '../errors/email-already-used.error';
import { CreateUserInput, UserRecord, UsersRepository } from './users.repository';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toRecord(user) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toRecord(user) : null;
  }

  async create(input: CreateUserInput): Promise<UserRecord> {
    try {
      const user = await this.prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
          role: input.role as PrismaRole,
        },
      });
      return this.toRecord(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new EmailAlreadyUsedError();
      }
      throw error;
    }
  }

  private toRecord(user: User): UserRecord {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as Role,
    };
  }
}
