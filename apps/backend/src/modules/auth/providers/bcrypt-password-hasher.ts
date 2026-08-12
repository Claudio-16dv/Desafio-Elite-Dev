import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from './password-hasher';

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  hash(value: string): Promise<string> {
    return bcrypt.hash(value, 10);
  }

  compare(value: string, hash: string): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
