import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateTournamentTasksDto,
  EvaluateSubmissionDto,
  SubmitTaskDto,
  UpdateTaskDto,
} from './dto';
import { JuryService } from 'src/jury/jury.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(TasksService.name)
    private readonly logger: PinoLogger,
    private readonly juryService: JuryService,
  ) {}

  async createTasks(tournamentId: string, dto: CreateTournamentTasksDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const orders = dto.tasks.map((t) => t.order);
    if (new Set(orders).size !== orders.length) {
      throw new BadRequestException('Task order values must be unique');
    }

    const created = await this.prisma.$transaction(
      dto.tasks.map((task) =>
        this.prisma.task.create({
          data: {
            tournamentId,
            name: task.name,
            description: task.description,
            order: task.order,
            criteria: task.criteria as Prisma.InputJsonValue,
          },
        }),
      ),
    );

    this.logger.info(
      { tournamentId, taskCount: created.length },
      'Tournament tasks created',
    );
    return created;
  }

  async updateTask(id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const hasAny =
      dto.name !== undefined ||
      dto.description !== undefined ||
      dto.order !== undefined ||
      dto.criteria !== undefined;
    if (!hasAny) {
      throw new BadRequestException('At least one field must be provided');
    }

    if (dto.order !== undefined) {
      const conflict = await this.prisma.task.findFirst({
        where: {
          tournamentId: existing.tournamentId,
          order: dto.order,
          NOT: { id },
        },
      });
      if (conflict) {
        throw new BadRequestException(
          'Task order already used in this tournament',
        );
      }
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.criteria !== undefined && {
          criteria: dto.criteria as Prisma.InputJsonValue,
        }),
      },
    });
    this.logger.info(
      { taskId: id, tournamentId: existing.tournamentId },
      'Task updated',
    );
    return updated;
  }

  async submitTask(taskId: string, dto: SubmitTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const team = await this.prisma.team.findFirst({
      where: {
        id: dto.teamId,
        tournaments: { some: { id: task.tournamentId } },
      },
    });
    if (!team) {
      throw new BadRequestException(
        'Team is not registered for this tournament',
      );
    }

    const existing = await this.prisma.submission.findUnique({
      where: {
        taskId_teamId: { taskId, teamId: dto.teamId },
      },
    });
    if (existing?.status === SubmissionStatus.EVALUATED) {
      throw new BadRequestException('Submission already evaluated');
    }

    const submission = await this.prisma.submission.upsert({
      where: {
        taskId_teamId: { taskId, teamId: dto.teamId },
      },
      create: {
        taskId,
        teamId: dto.teamId,
        githubUrl: dto.githubUrl,
        videoUrl: dto.videoUrl,
      },
      update: {
        githubUrl: dto.githubUrl,
        videoUrl: dto.videoUrl,
      },
    });
    this.logger.info(
      { taskId, teamId: dto.teamId, submissionId: submission.id },
      'Task submission upserted',
    );
    return submission;
  }

  async getSubmissionsForTask(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.submission.findMany({
      where: { taskId },
      orderBy: { id: 'asc' },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            captainName: true,
            captainEmail: true,
            city: true,
            organization: true,
          },
        },
      },
    });
  }

  async evaluateSubmission(
    submissionId: string,
    userId: string,
    dto: EvaluateSubmissionDto,
  ) {
    const jury = await this.juryService.findOne(userId);
    if (!jury) {
      throw new BadRequestException('Jury profile not found');
    }

    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: { select: { criteria: true } } },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const criteriaUnknown: unknown = submission.task.criteria;
    const rubric =
      criteriaUnknown &&
      typeof criteriaUnknown === 'object' &&
      'rubric' in criteriaUnknown
        ? (criteriaUnknown as { rubric?: unknown }).rubric
        : undefined;
    if (!Array.isArray(rubric) || rubric.length === 0) {
      throw new BadRequestException('Task criteria rubric is missing');
    }

    const rubricById = new Map<string, number>();
    for (const item of rubric) {
      const obj =
        item && typeof item === 'object'
          ? (item as Record<string, unknown>)
          : null;
      const id = typeof obj?.id === 'string' ? obj.id : null;
      const maxPoints =
        typeof obj?.maxPoints === 'number' ? obj.maxPoints : null;
      if (!id || maxPoints === null) continue;
      rubricById.set(id, maxPoints);
    }
    if (rubricById.size === 0) {
      throw new BadRequestException('Task criteria rubric is invalid');
    }

    const incomingIds = dto.scores.map((s) => s.id);
    if (new Set(incomingIds).size !== incomingIds.length) {
      throw new BadRequestException('Duplicate rubric item id in scores');
    }

    const missingIds: string[] = [];
    for (const id of rubricById.keys()) {
      if (!incomingIds.includes(id)) missingIds.push(id);
    }
    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Missing scores for rubric items: ${missingIds.join(', ')}`,
      );
    }

    for (const s of dto.scores) {
      const max = rubricById.get(s.id);
      if (max === undefined) {
        throw new BadRequestException(`Unknown rubric item id: ${s.id}`);
      }
      if (s.points > max) {
        throw new BadRequestException(
          `Points for "${s.id}" exceed maxPoints (${s.points} > ${max})`,
        );
      }
    }

    const totalScore = dto.scores.reduce((sum, s) => sum + s.points, 0);
    const scoresJson: Prisma.InputJsonValue = {
      rubric: dto.scores.map((s) => ({ id: s.id, points: s.points })),
    };

    const [evaluation] = await this.prisma.$transaction([
      this.prisma.evaluation.upsert({
        where: {
          submissionId_juryId: { submissionId, juryId: jury.id },
        },
        create: {
          submissionId,
          juryId: jury.id,
          scores: scoresJson,
          totalScore,
          comment: dto.comment,
        },
        update: {
          scores: scoresJson,
          totalScore,
          comment: dto.comment,
        },
      }),
      this.prisma.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.EVALUATED },
      }),
    ]);

    this.logger.info(
      {
        submissionId,
        juryId: jury.id,
        userId,
        totalScore,
      },
      'Submission evaluated',
    );
    return evaluation;
  }
}
