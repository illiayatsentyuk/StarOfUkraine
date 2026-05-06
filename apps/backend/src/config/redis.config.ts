import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL,
  ttl: process.env.CACHE_TTL_MS,
}));
