import KeyvRedis from '@keyv/redis';
import { CacheModule, type CacheOptions } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { Logger, LoggerModule } from 'pino-nestjs';
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
import { JuryModule } from './jury/jury.module';
import { TasksModule } from './tasks/tasks.module';
import { TeamModule } from './team/team.module';
import { TournamentModule } from './tournament/tournament.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
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
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv =
          configService.get<string>('NODE_ENV') ??
          process.env.NODE_ENV ??
          'development';
        const isProd = nodeEnv === 'production';
        const isTest = nodeEnv === 'test';

        return {
          pinoHttp: {
            level: isTest ? 'silent' : isProd ? 'info' : 'debug',
            transport:
              !isProd && !isTest
                ? {
                    target: 'pino-pretty',
                    options: { colorize: true, singleLine: true },
                  }
                : undefined,
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                '*.password',
                '*.hash',
                '*.hashedRt',
                '*.resetToken',
              ],
              censor: '[REDACTED]',
            },
            serializers: {
              req(req: { method?: string; url?: string; id?: string }) {
                return { method: req.method, url: req.url, id: req.id };
              },
            },
          },
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (
        configService: ConfigService,
        logger: Logger,
      ): CacheOptions => {
        const url = configService.getOrThrow<RedisConfig>('redis').url;
        const ttl = Number(configService.getOrThrow<RedisConfig>('redis').ttl);

        logger.log(`Redis cache configured (TTL ${ttl} ms)`);
        const stores = new KeyvRedis(url);
        return { stores, ttl };
      },
      inject: [ConfigService, Logger],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),
    AuthModule,
    TeamModule,
    TournamentModule,
    UsersModule,
    TasksModule,
    EmailModule,
    JuryModule,
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
