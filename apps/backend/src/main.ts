import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import type { MicroserviceOptions } from '@nestjs/microservices';
import {
  SubmissionListItemDto,
  SubmissionTeamSummaryDto,
} from './tasks/dto/submission.dto';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from './common/types/redis-config.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('bootstrap');

  const configService = app.get(ConfigService);
  const redisConfig = configService.get<RedisConfig>('redis');
  if (redisConfig?.url) {
    logger.log(`Connecting to Redis: ${redisConfig.url}`);
    const redisUrl = new URL(redisConfig.url);
    const port = redisUrl.port ? Number(redisUrl.port) : 6379;

    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.REDIS,
      options: {
        host: redisUrl.hostname,
        port,
      },
    });
    await app.startAllMicroservices();
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:4040',
      'https://star-of-ukraine-frontend.vercel.app',
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const config = new DocumentBuilder()
    .setTitle('StarOfUkraine API')
    .setDescription(
      [
        'Star of Ukraine — REST API.',
        'Domains: authentication (JWT + cookies), users, teams, tournaments, tasks (rounds), submissions, jury review.',
        'Most protected routes accept `access_token` cookie or `Authorization: Bearer <token>`.',
      ].join(' '),
    )
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addCookieAuth('refresh_token')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [SubmissionListItemDto, SubmissionTeamSummaryDto],
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(Number(process.env.PORT ?? 3000));
}
void bootstrap();
