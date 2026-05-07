import KeyvRedis from '@keyv/redis';
import { CacheModule, type CacheOptions } from '@nestjs/cache-manager';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AtGuard } from './common/guards/at.guard';
import { RolesGuard } from './common/guards/roles.guard';
import type { RedisConfig } from './common/types';
import databaseConfig from './config/database.config';
import googleConfig from './config/google.config';
import jwtConfig from './config/jwt.config';
import paginationConfig from './config/pagination.config';
import redisConfig from './config/redis.config';
import resetPasswordConfig from './config/reset-password.config';
import sendMailConfig from './config/send-mail.config';
import { EmailModule } from './email/email.module';
import { GatewayModule } from './gateway/gateway.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamModule } from './team/team.module';
import { TournamentModule } from './tournament/tournament.module';
import { UsersModule } from './users/users.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisTestModule } from './redis-test/redis-test.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
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
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        jwtConfig,
        paginationConfig,
        databaseConfig,
        googleConfig,
        resetPasswordConfig,
        sendMailConfig,
        redisConfig,
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): CacheOptions => {
        const logger = new Logger('CacheModule');
        const url = configService.getOrThrow<RedisConfig>('redis').url;
        const ttl = Number(configService.getOrThrow<RedisConfig>('redis').ttl);

        logger.log(`Connecting to Redis: ${url} (TTL ${ttl} ms)`);
        const stores = new KeyvRedis(url);
        return { stores, ttl };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    TeamModule,
    TournamentModule,
    GatewayModule,
    UsersModule,
    TasksModule,
    EmailModule,
    RedisTestModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
