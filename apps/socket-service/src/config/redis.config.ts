import { registerAs } from '@nestjs/config';

export interface SocketRedisConfig {
  url: string;
  host: string;
  port: number;
}

function parseRedisUrl(url: string): { host: string; port: number } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || 'localhost',
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

export default registerAs('redis', (): SocketRedisConfig => {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const { host, port } = parseRedisUrl(url);
  return { url, host, port };
});
