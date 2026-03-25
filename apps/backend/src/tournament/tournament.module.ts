import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaService } from '../prisma/prisma.service'
import { TournamentController } from './tournament.controller'
import { TournamentService } from './tournament.service'

@Module({
  controllers: [TournamentController],
  providers: [TournamentService, PrismaService],
  imports: [ConfigModule],
  exports: [TournamentService],
})
export class TournamentModule {}
