/** Shape attached to `req.user` during Google OAuth (before or instead of JWT payload). */
export type OAuthUserPayload = {
  sub: string;
  email: string;
  name?: string | null;
  picture?: string | null;
};
