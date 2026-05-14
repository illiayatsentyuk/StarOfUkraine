import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Prisma, Role } from '@prisma/client';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import paginationConfig from '../config/pagination.config';
import { SortOrder, TeamsSortBy } from '../enum';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto, FindTeamQueryDto, UpdateTeamDto } from './dto';

const memberUserSelect = {
  id: true,
  email: true,
  name: true,
  nameId: true,
  image: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

const teamInclude = {
  members: { select: memberUserSelect },
  captain: { select: memberUserSelect },
  submissions: {
    select: {
      evaluations: { select: { totalScore: true } },
    },
  },
};

function computePoints(team: {
  submissions?: Array<{ evaluations: Array<{ totalScore: number }> }>;
}): number {
  if (!team.submissions) return 0;
  return team.submissions.reduce(
    (sum, sub) => sum + sub.evaluations.reduce((s, e) => s + e.totalScore, 0),
    0,
  );
}

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(paginationConfig.KEY)
    private readonly paginationsConfig: ConfigType<typeof paginationConfig>,
    @InjectPinoLogger(TeamService.name)
    private readonly logger: PinoLogger,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async assertUserExistsByEmail(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  async create(data: CreateTeamDto, creatorEmail: string) {
    const existingTeam = await this.prisma.team.findFirst({
      where: {
        name: data.name,
      },
    });
    if (existingTeam) {
      throw new BadRequestException('Team already exists');
    }

    const captainEmail = this.normalizeEmail(creatorEmail);
    await this.assertUserExistsByEmail(captainEmail);

    const team = await this.prisma.team.create({
      data: {
        name: data.name,
        captainName: data.captainName,
        captain: {
          connect: { email: captainEmail },
        },
        members: {
          connect: [{ email: captainEmail }],
        },
        city: data.city,
        organization: data.organization,
        telegram: data.telegram,
        discord: data.discord,
      },
      include: teamInclude,
    });
    this.logger.info({ teamId: team.id, name: team.name }, 'Team created');
    return team;
  }

  async findAll(query: FindTeamQueryDto) {
    const name = (query.name ?? '').trim();
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? this.paginationsConfig.pageSize);
    const totalCount = await this.prisma.team.count();
    const maximumPage = Math.max(1, Math.ceil(totalCount / limit));

    if (page > maximumPage || page < 1) {
      throw new BadRequestException('Page number is out of range');
    }

    const sortBy = query.sortBy ?? TeamsSortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    const where: Prisma.TeamWhereInput | undefined = name
      ? {
          OR: [
            {
              name: {
                contains: name,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              id: {
                contains: name,
              },
            },
          ],
        }
      : undefined;

    const teams = await this.prisma.team.findMany({
      where,
      skip: Number(page - 1) * Number(limit),
      take: Number(limit),
      orderBy: {
        [sortBy]: sortOrder === SortOrder.ASC ? 'asc' : 'desc',
      },
      include: teamInclude,
    });

    return {
      data: teams.map((t) => ({ ...t, points: computePoints(t) })),
      currentPage: Number(page),
      nextPage: page < maximumPage ? Number(page) + 1 : null,
      previousPage: page > 1 ? Number(page) - 1 : null,
      totalPages: Number(maximumPage),
      itemsPerPage: Number(limit),
    };
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: teamInclude,
    });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return { ...team, points: computePoints(team) };
  }

  async update(id: string, data: UpdateTeamDto, userRole: Role) {
    const existing = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: { select: { email: true } },
        tournaments: {
          select: { registrationEnd: true },
        },
      },
    });
    if (!existing) {
      throw new NotFoundException('Team not found');
    }

    if (userRole !== Role.ADMIN) {
      const now = new Date();
      const isLockedByTournament = existing.tournaments.some(
        (t) => now > new Date(t.registrationEnd),
      );
      if (isLockedByTournament) {
        throw new ForbiddenException(
          'Team cannot be edited after tournament registration has closed. Contact an admin.',
        );
      }
    }

    if (data.name !== undefined && data.name !== existing.name) {
      const nameTaken = await this.prisma.team.findFirst({
        where: { name: data.name, NOT: { id } },
      });
      if (nameTaken) {
        throw new BadRequestException('Team with this name already exists');
      }
    }

    const captainEmail =
      data.captainEmail !== undefined
        ? this.normalizeEmail(data.captainEmail)
        : existing.captainEmail;

    if (data.captainEmail !== undefined) {
      await this.assertUserExistsByEmail(captainEmail);
    }

    const updated = await this.prisma.team.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.captainName !== undefined && {
          captainName: data.captainName,
        }),
        ...(data.captainEmail !== undefined && {
          captain: { connect: { email: captainEmail } },
        }),
        ...(data.city !== undefined && { city: data.city }),
        ...(data.organization !== undefined && {
          organization: data.organization,
        }),
        ...(data.telegram !== undefined && { telegram: data.telegram }),
        ...(data.discord !== undefined && { discord: data.discord }),
      },
      include: teamInclude,
    });
    this.logger.info({ teamId: id }, 'Team updated');
    return updated;
  }

  async join(teamId: string, userEmail: string) {
    const team = await this.findOne(teamId);
    const email = this.normalizeEmail(userEmail);
    await this.assertUserExistsByEmail(email);

    if (team.isAcceptNewMembers === false) {
      throw new BadRequestException('Team is not accepting new members');
    }

    const alreadyMember = team.members.some((m) => m.email === email);
    if (alreadyMember) {
      throw new BadRequestException('User is already a team member');
    }

    const joined = await this.prisma.team.update({
      where: { id: teamId },
      data: {
        members: {
          connect: { email },
        },
      },
      include: teamInclude,
    });
    this.logger.info({ teamId: teamId }, 'User joined team');
    return joined;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prisma.team.delete({
      where: { id },
      include: teamInclude,
    });
    this.logger.info({ teamId: id }, 'Team deleted');
    return deleted;
  }
}
