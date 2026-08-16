import { Role } from '@app/shared';

export interface TokenPayload {
  sub: string;
  role: Role;
  organizerId?: string;
}

export abstract class TokenProvider {
  abstract sign(payload: TokenPayload): Promise<string>;
}
