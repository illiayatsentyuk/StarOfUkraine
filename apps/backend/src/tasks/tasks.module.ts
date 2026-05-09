import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JuryModule } from 'src/jury/jury.module';

@Module({
  imports: [JuryModule],
  controllers: [TasksController],
  providers: [TasksService, PrismaService],
  exports: [TasksService],
})
export class TasksModule {}
