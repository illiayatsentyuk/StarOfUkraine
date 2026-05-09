import { createHash } from 'node:crypto';

export const CACHE_TTL = {
  VERSION: 24 * 60 * 60 * 1000, // 24 h – must outlive LIST / ONE / LEADERBOARD
  LIST: 5 * 60 * 1000, // 5 min
  ONE: 2 * 60 * 1000, // 2 min
  LEADERBOARD: 30 * 1000, // 30 s
} as const;

export const CacheKeys = {
  LIST_VERSION: 'tournaments:list:version',
  ONE_VERSION: (id: string) => `tournament:${id}:version`,
  LIST: (version: number, queryHash: string) =>
    `tournaments:list:v${version}:${queryHash}`,
  ONE: (id: string, version: number) => `tournament:${id}:v${version}`,
  LEADERBOARD: (id: string, version: number) =>
    `tournament:${id}:leaderboard:v${version}`,
} as const;

export function hashQuery(obj: object): string {
  return createHash('md5')
    .update(JSON.stringify(obj))
    .digest('hex')
    .slice(0, 8);
}
