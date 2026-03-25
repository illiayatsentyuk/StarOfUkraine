import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../../common/types';
import { ConfigService } from '@nestjs/config';

function cookieExtractor(cookieName: string) {
  return (req: Request): string | null => {
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    return cookies?.[cookieName] ?? null;
  };
}

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor('access_token'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get<string>('jwt.at.secret'),
    });
  }

  validate(payload: JwtPayload) {
    return payload;
  }
}
