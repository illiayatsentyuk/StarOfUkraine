import { Inject, Injectable } from "@nestjs/common";
import type { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-google-oauth20";
import googleConfig from 'src/config/google.config';
import type { Profile, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(@Inject(googleConfig.KEY) private googleKeysConfig: ConfigType<typeof googleConfig>){
        super({
            clientID: googleKeysConfig.clientId,
            clientSecret: googleKeysConfig.clientSecret,
            callbackURL: googleKeysConfig.callbackURL,
            scope: ['email', 'profile'],
        })
    }

    validate(accessToken: string, refreshToken: string, profile: Profile, done:VerifyCallback) {
        console.log(profile);
    }
}