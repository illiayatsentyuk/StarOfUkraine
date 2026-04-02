import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  controllers: [TeamController],
  providers: [TeamService, PrismaService],
  imports: [ConfigModule],
  exports: [TeamService],
})
export class TeamModule {}
