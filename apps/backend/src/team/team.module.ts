import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [TeamController],
  providers: [TeamService, PrismaService],
  imports: [ConfigModule],
  exports: [TeamService],
})
export class TeamModule {}
