import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './adapters/redis-io.adapter';
import type { SocketRedisConfig } from './config/redis.config';
import { Logger } from 'pino-nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(Logger));

  const allowedOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:4040';
  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
  });

  const configService = app.get(
    (await import('@nestjs/config')).ConfigService,
  );

  const redis = configService.getOrThrow<SocketRedisConfig>('redis');

  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis(redis.url);
  app.useWebSocketAdapter(redisAdapter);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redis.host,
      port: redis.port,
    },
  });

  await app.startAllMicroservices();

  const port = process.env.SOCKET_PORT ?? 3001;
  await app.listen(port);

  console.log(`Socket service is running on port ${port}`);
  console.log(`Redis microservice transport connected to ${redis.url}`);
}

bootstrap();
