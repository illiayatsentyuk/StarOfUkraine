import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
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
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor('refresh_token'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get<string>('jwt.rt.secret'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const refreshToken =
      (req as Request & { cookies?: Record<string, string> }).cookies
        ?.refresh_token ??
      req.get('authorization')?.replace('Bearer', '').trim();
    return {
      ...payload,
      refreshToken,
    };
  }
}
