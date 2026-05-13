import { registerAs } from '@nestjs/config';
import type { RedisConfig } from '../common/types/redis-config.type';

function msFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw == null || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export default registerAs(
  'redis',
  (): RedisConfig => ({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: msFromEnv('CACHE_TTL_MS', 5 * 60 * 1000),
  }),
);
