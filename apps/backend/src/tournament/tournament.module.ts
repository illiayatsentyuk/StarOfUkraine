import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';
import { RedisConfig } from 'src/common/types/redis-config.type';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService, PrismaService],
  imports: [ConfigModule, ClientsModule.registerAsync([
    {
      name: 'REDIS_SERVICE',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        name: 'REDIS_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: configService.getOrThrow<RedisConfig>('redis').url.split('://')[1].split(':')[0],
          port: Number(configService.getOrThrow<RedisConfig>('redis').url.split('://')[1].split(':')[1]),
        },
      }),
    },
  ])],
  exports: [TournamentService],
})
export class TournamentModule {}
