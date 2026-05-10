import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { OAuthUserPayload } from 'src/common/types';
import googleConfig from 'src/config/google.config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleConfig.KEY)
    private googleKeysConfig: ConfigType<typeof googleConfig>,
    private authService: AuthService,
    @InjectPinoLogger(GoogleStrategy.name)
    private readonly logger: PinoLogger,
  ) {
    super({
      clientID: googleKeysConfig.clientId,
      clientSecret: googleKeysConfig.clientSecret,
      callbackURL: googleKeysConfig.callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    this.logger.debug(
      { googleAccountId: profile.id },
      'Google OAuth profile validated',
    );
    const picture =
      profile._json.picture ??
      (Array.isArray(profile.photos) ? profile.photos[0]?.value : undefined);
    const user = await this.authService.findOrCreateFromGoogle({
      id: profile.id,
      email: profile._json.email ?? '',
      name: profile._json.name,
      picture,
    });
    done(null, { sub: user.id, email: user.email, role: user.role });
  }
}
