import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import {
  SubmissionListItemDto,
  SubmissionTeamSummaryDto,
} from './tasks/dto/submission.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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
    // We authenticate via HttpOnly cookies, but keep Bearer as fallback.
    .addCookieAuth('access_token')
    .addCookieAuth('refresh_token')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [SubmissionListItemDto, SubmissionTeamSummaryDto],
  });
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
