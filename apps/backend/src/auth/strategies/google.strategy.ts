import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Profile, VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';
import { OAuthUserPayload } from 'src/common/types';
import googleConfig from 'src/config/google.config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    @Inject(googleConfig.KEY)
    private googleKeysConfig: ConfigType<typeof googleConfig>,
    private authService: AuthService,
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
      `Google profile received: id=${profile.id}, email=${profile._json.email ?? 'n/a'}`,
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
    // Normalize shape to match JWT payload used across the app (sub/email/role).
    done(null, { sub: user.id, email: user.email, role: user.role });
  }
}
