import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TournamentStatus } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentSchedulerService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(TournamentSchedulerService.name)
    private readonly logger: PinoLogger,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleTournamentStatusTransitions() {
    const now = new Date();

    const openedRegistration = await this.prisma.tournament.updateMany({
      where: {
        status: TournamentStatus.DRAFT,
        registrationStart: { lte: now },
      },
      data: { status: TournamentStatus.REGISTRATION_OPEN },
    });

    if (openedRegistration.count > 0) {
      this.logger.info(
        { count: openedRegistration.count },
        'Tournaments transitioned DRAFT → REGISTRATION_OPEN',
      );
    }

    const startedTournaments = await this.prisma.tournament.updateMany({
      where: {
        status: TournamentStatus.REGISTRATION_OPEN,
        registrationEnd: { lte: now },
      },
      data: { status: TournamentStatus.ONGOING },
    });

    if (startedTournaments.count > 0) {
      this.logger.info(
        { count: startedTournaments.count },
        'Tournaments transitioned REGISTRATION_OPEN → ONGOING',
      );
    }

    const completedTournaments = await this.prisma.tournament.updateMany({
      where: {
        status: TournamentStatus.ONGOING,
        evaluationFinishedAt: { not: null },
      },
      data: { status: TournamentStatus.COMPLETED },
    });

    if (completedTournaments.count > 0) {
      this.logger.info(
        { count: completedTournaments.count },
        'Tournaments transitioned ONGOING → COMPLETED',
      );
    }
  }
}
