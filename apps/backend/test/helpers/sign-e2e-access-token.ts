import * as jwt from 'jsonwebtoken';
import { Role } from '../../src/enum';

export function signE2eAccessToken(role: Role): string {
  const secret = process.env.AT_SECRET;
  if (!secret) {
    throw new Error(
      'AT_SECRET must be set for e2e tests that call protected routes',
    );
  }
  return jwt.sign(
    { sub: 'e2e-user-id', email: 'e2e@example.com', role },
    secret,
    { expiresIn: '1h' },
  );
}
