import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateTournamentTasksDto,
  SubmitTaskDto,
  UpdateTaskDto,
} from './dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

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

    return this.prisma.task.update({
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

    return this.prisma.submission.upsert({
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
}
