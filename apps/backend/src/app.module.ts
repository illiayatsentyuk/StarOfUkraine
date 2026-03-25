import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { TournamentModule } from './tournament/tournament.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards/at.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { ConfigModule } from '@nestjs/config';
import jwtConfig from './config/jwt.config';
import paginationConfig from './config/pagination.config';
import databaseConfig from './config/database.config';
import googleConfig from './config/google.config';

@Module({
  imports: [
    AuthModule,
    TeamModule,
    TournamentModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig, paginationConfig, databaseConfig, googleConfig],
    }),
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
