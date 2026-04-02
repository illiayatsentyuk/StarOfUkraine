/** Shape attached to `req.user` during Google OAuth (before or instead of JWT payload). */
export type OAuthUserPayload = {
  id: string;
  email: string;
  name?: string | null;
  picture?: string | null;
};
