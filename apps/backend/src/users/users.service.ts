import { Injectable, NotFoundException } from '@nestjs/common';
import { TournamentStatus } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { Role } from 'src/enum';
import { PrismaService } from '../prisma/prisma.service';
import { FindUsersDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
  ) {}

  findAll() {
    return this.prisma.user.findMany({});
  }

  async findOne(identifier: string) {
    const trimmed = identifier.trim();
    const normalizedEmail = trimmed.toLowerCase();

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { nameId: trimmed }],
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    this.logger.debug({ userId: user.id }, 'User resolved by identifier');
    return user;
  }

  findUsers(dto: FindUsersDto) {
    const q = dto.query.trim();
    this.logger.debug({ queryLength: q.length }, 'User search');
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { nameId: { contains: q, mode: 'insensitive' } },
        ],
      },
    });
  }

  updateRole(userId: string, role: Role) {
    return this.prisma.user.update({ where: { id: userId }, data: { role } });
  }

  updateMe(userId: string, dto: UpdateUserDto) {
    this.logger.debug({ userId }, 'Updating user profile');
    return this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name },
      select: {
        id: true,
        email: true,
        name: true,
        nameId: true,
        image: true,
        role: true,
      },
    });
  }

  updateAvatar(userId: string, filename: string) {
    const imageUrl = `/uploads/avatars/${filename}`;
    this.logger.debug({ userId, imageUrl }, 'Updating user avatar');
    return this.prisma.user.update({
      where: { id: userId },
      data: { image: imageUrl },
      select: {
        id: true,
        email: true,
        name: true,
        nameId: true,
        image: true,
        role: true,
      },
    });
  }

  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        nameId: true,
        image: true,
        role: true,
        teamsAsMember: {
          select: {
            id: true,
            name: true,
            tournaments: {
              where: {
                status: {
                  in: [
                    TournamentStatus.ONGOING,
                    TournamentStatus.REGISTRATION_OPEN,
                  ],
                },
              },
              select: {
                id: true,
                name: true,
                status: true,
                tasks: {
                  where: { status: 'ACTIVE' },
                  select: { id: true, name: true, deadline: true },
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
            submissions: {
              orderBy: { id: 'desc' },
              take: 5,
              select: {
                id: true,
                taskId: true,
                status: true,
                githubUrl: true,
                videoUrl: true,
              },
            },
          },
        },
        jury: {
          select: {
            id: true,
            assignments: {
              where: {
                submission: {
                  status: 'PENDING',
                },
              },
              select: { id: true, submissionId: true },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const activeTournament = user.teamsAsMember
      .flatMap((t) => t.tournaments)
      .find((t) => t.status === TournamentStatus.ONGOING);

    const activeTask = activeTournament?.tasks?.[0] ?? null;

    const currentTeam = activeTournament
      ? user.teamsAsMember.find((t) =>
          t.tournaments.some((tr) => tr.id === activeTournament.id),
        )
      : (user.teamsAsMember[0] ?? null);

    const latestSubmission = currentTeam?.submissions?.[0] ?? null;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nameId: user.nameId,
        image: user.image,
        role: user.role,
      },
      currentTeam: currentTeam
        ? { id: currentTeam.id, name: currentTeam.name }
        : null,
      activeTournament: activeTournament
        ? {
            id: activeTournament.id,
            name: activeTournament.name,
            status: activeTournament.status,
          }
        : null,
      activeTask,
      latestSubmission,
      pendingEvaluations: user.jury?.assignments?.length ?? 0,
    };
  }

  async getParticipationHistory(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        teamsAsMember: {
          select: {
            id: true,
            name: true,
            tournaments: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
              },
              orderBy: { startDate: 'desc' },
            },
            submissions: {
              select: {
                id: true,
                taskId: true,
                githubUrl: true,
                videoUrl: true,
                liveUrl: true,
                status: true,
                task: {
                  select: { name: true, tournamentId: true },
                },
              },
              orderBy: { id: 'desc' },
            },
          },
        },
        jury: {
          select: {
            tournaments: {
              select: {
                id: true,
                name: true,
                status: true,
                startDate: true,
              },
              orderBy: { startDate: 'desc' as const },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      teams: user.teamsAsMember.map((team) => ({
        team: { id: team.id, name: team.name },
        tournaments: team.tournaments,
        submissions: team.submissions.map((s) => ({
          id: s.id,
          taskId: s.taskId,
          taskName: s.task.name,
          tournamentId: s.task.tournamentId,
          githubUrl: s.githubUrl,
          videoUrl: s.videoUrl,
          liveUrl: s.liveUrl,
          status: s.status,
        })),
      })),
      juryTournaments: user.jury?.tournaments || [],
    };
  }
}
