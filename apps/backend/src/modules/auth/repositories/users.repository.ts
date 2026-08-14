import { Role } from '@app/shared';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface UpdateUserInput {
  name?: string;
  passwordHash?: string;
}

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<UserRecord | null>;
  abstract findById(id: string): Promise<UserRecord | null>;
  abstract create(input: CreateUserInput): Promise<UserRecord>;
  abstract update(id: string, input: UpdateUserInput): Promise<UserRecord>;
}
