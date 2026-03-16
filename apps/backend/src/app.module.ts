import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TeamModule } from './team/team.module';
import { TournamentModule } from './tournament/tournament.module';

@Module({
  imports: [AuthModule, TeamModule, TournamentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
