import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateTournamentTasksDto, UpdateTaskDto } from './dto';

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
}
