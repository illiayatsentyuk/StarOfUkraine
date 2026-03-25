import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import googleConfig from 'src/config/google.config';
import type { Profile, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { OAuthUserPayload } from 'src/common/types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
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
    const user = await this.authService.findOrCreateFromGoogle({
      sub: profile.id,
      email: profile?.emails?.[0]?.value ?? '',
      name: profile.displayName,
      picture: profile?.photos?.[0]?.value,
    });
    done(null, user);
  }
}
