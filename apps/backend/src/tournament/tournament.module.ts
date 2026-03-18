import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService, PrismaService],
  exports: [TournamentService],
})
export class TournamentModule {}

