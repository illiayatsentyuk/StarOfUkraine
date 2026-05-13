import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TournamentController } from './tournament.controller';
import { TournamentSchedulerService } from './tournament-scheduler.service';
import { TournamentService } from './tournament.service';

@Module({
  imports: [ConfigModule, ScheduleModule.forRoot()],
  controllers: [TournamentController],
  providers: [TournamentService, TournamentSchedulerService, PrismaService],
  exports: [TournamentService],
})
export class TournamentModule {}
