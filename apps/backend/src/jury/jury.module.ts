import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { JuryController } from './jury.controller';
import { JuryService } from './jury.service';

@Module({
  imports: [UsersModule],
  controllers: [JuryController],
  providers: [JuryService, PrismaService],
  exports: [JuryService],
})
export class JuryModule {}
