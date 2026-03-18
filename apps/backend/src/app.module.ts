import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { TournamentModule } from './tournament/tournament.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './common/guards/at.guard';

@Module({
  imports: [AuthModule, TeamModule, TournamentModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: AtGuard,
  },],
})
export class AppModule {}
