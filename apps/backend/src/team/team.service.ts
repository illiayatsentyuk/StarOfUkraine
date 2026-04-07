import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Prisma } from '@prisma/client';
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
};

@Injectable()
export class TeamService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(paginationConfig.KEY)
    private readonly paginationsConfig: ConfigType<typeof paginationConfig>,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private uniqueEmails(emails: string[]): string[] {
    return [...new Set(emails.map((e) => this.normalizeEmail(e)))];
  }

  private async assertMemberUsersExist(emails: string[]): Promise<void> {
    if (emails.length === 0) return;
    const users = await this.prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true },
    });
    if (users.length !== emails.length) {
      throw new NotFoundException(
        'One or more member emails are not registered users',
      );
    }
  }

  async create(data: CreateTeamDto) {
    const existingTeam = await this.prisma.team.findFirst({
      where: {
        name: data.name,
      },
    });
    if (existingTeam) {
      throw new BadRequestException('Team already exists');
    }

    const captainEmail = this.normalizeEmail(data.captainEmail);
    const memberEmails = this.uniqueEmails(data.memberEmails);

    if (!memberEmails.includes(captainEmail)) {
      throw new BadRequestException(
        'Captain email must be included in member emails',
      );
    }

    await this.assertMemberUsersExist(memberEmails);

    return this.prisma.team.create({
      data: {
        name: data.name,
        captainName: data.captainName,
        captain: {
          connect: { email: captainEmail },
        },
        members: {
          connect: memberEmails.map((email) => ({ email })),
        },
        city: data.city,
        organization: data.organization,
        telegram: data.telegram,
        discord: data.discord,
      },
      include: teamInclude,
    });
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
      data: teams,
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
    return team;
  }

  async update(id: string, data: UpdateTeamDto) {
    const existing = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: { select: { email: true } },
      },
    });
    if (!existing) {
      throw new NotFoundException('Team not found');
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

    let memberEmails: string[];
    if (data.memberEmails !== undefined) {
      memberEmails = this.uniqueEmails(data.memberEmails);
    } else {
      memberEmails = existing.members.map((m) => m.email);
    }

    if (data.captainEmail !== undefined && !memberEmails.includes(captainEmail)) {
      memberEmails = [...memberEmails, captainEmail];
    }

    if (!memberEmails.includes(captainEmail)) {
      throw new BadRequestException(
        'Captain email must be included in member emails',
      );
    }

    await this.assertMemberUsersExist(memberEmails);

    const membersRelationChanged =
      data.memberEmails !== undefined || data.captainEmail !== undefined;

    return this.prisma.team.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.captainName !== undefined && { captainName: data.captainName }),
        ...(data.captainEmail !== undefined && {
          captain: { connect: { email: captainEmail } },
        }),
        ...(membersRelationChanged && {
          members: {
            set: memberEmails.map((email) => ({ email })),
          },
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
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.team.delete({
      where: { id },
      include: teamInclude,
    });
  }
}
