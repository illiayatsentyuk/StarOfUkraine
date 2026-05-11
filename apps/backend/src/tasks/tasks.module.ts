import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import type { RedisConfig } from 'src/common/types';
import { JuryModule } from 'src/jury/jury.module';
import { PrismaService } from '../prisma/prisma.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

export const SOCKET_SERVICE = 'SOCKET_SERVICE';

@Module({
  imports: [
    JuryModule,
    ClientsModule.registerAsync([
      {
        name: SOCKET_SERVICE,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: parseRedisHost(
              configService.getOrThrow<RedisConfig>('redis').url,
            ),
            port: parseRedisPort(
              configService.getOrThrow<RedisConfig>('redis').url,
            ),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService, PrismaService],
  exports: [TasksService],
})
export class TasksModule {}

function parseRedisHost(url: string): string {
  try {
    return new URL(url).hostname || 'localhost';
  } catch {
    return 'localhost';
  }
}

function parseRedisPort(url: string): number {
  try {
    const port = new URL(url).port;
    return port ? parseInt(port, 10) : 6379;
  } catch {
    return 6379;
  }
}
