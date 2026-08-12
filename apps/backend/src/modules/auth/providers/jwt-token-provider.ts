import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload, TokenProvider } from './token-provider';

@Injectable()
export class JwtTokenProvider extends TokenProvider {
  constructor(private readonly jwt: JwtService) {
    super();
  }

  sign(payload: TokenPayload): Promise<string> {
    return this.jwt.signAsync(payload);
  }
}
