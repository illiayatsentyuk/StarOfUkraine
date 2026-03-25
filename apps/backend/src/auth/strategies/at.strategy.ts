import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../../common/types';

function cookieExtractor(cookieName: string) {
  return (req: Request): string | null => {
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[cookieName] ?? null;
  };
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor('access_token'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: process.env.AT_SECRET,
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
