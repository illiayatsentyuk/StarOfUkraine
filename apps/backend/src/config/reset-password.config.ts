import { registerAs } from '@nestjs/config';

export default registerAs('resetPassword', () => ({
  secret:process.env.RESET_PASSWORD_SECRET,
  expiresIn:process.env.RESET_PASSWORD_EXPIRES_IN,
  resetUrl: process.env.EMAIL_RESET_PASSWORD_URL,
}));
