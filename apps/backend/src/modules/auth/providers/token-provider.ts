import { Role } from '@app/shared';

export interface TokenPayload {
  sub: string;
  role: Role;
}

export abstract class TokenProvider {
  abstract sign(payload: TokenPayload): Promise<string>;
}
