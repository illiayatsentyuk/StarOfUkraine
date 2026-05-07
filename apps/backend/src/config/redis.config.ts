import { registerAs } from '@nestjs/config';
import type { RedisConfig } from '../common/types/redis-config.type';

export default registerAs('redis', (): RedisConfig => ({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  ttl: Number(process.env.CACHE_TTL_MS),
}));
