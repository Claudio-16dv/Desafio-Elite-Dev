import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@app/shared';
import { TokenPayload } from '../providers/token-provider';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  organizerId?: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  validate(payload: TokenPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      role: payload.role,
      organizerId: payload.organizerId ?? null,
    };
  }
}
