import { Module } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { TournamentController } from './tournament.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [TournamentController],
  providers: [TournamentService, PrismaService],
  imports: [ConfigModule],
  exports: [TournamentService],
})
export class TournamentModule {}
