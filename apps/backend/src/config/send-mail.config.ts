import { registerAs } from '@nestjs/config';

export default registerAs('sendMail', () => {
  return {
    host: process.env.EMAIL_HOST?.trim() || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },  
  };
});
