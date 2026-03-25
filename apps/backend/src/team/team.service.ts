import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { FindQueryDto } from '../common/dto/find-query.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly defaultPageSize = Number(process.env.PAGE_SIZE) || 10;

  async create(data: CreateTeamDto) {
    const existingTeam = await this.prisma.team.findFirst({
      where: {
        teamName: data.teamName,
      },
    });
    if (existingTeam) {
      throw new BadRequestException('Team already exists');
    }
    const team = await this.prisma.team.create({
      data: {
        teamName: data.teamName,
        captainName: data.captainName,
        captainEmail: data.captainEmail,
        members: data.members,
        city: data.city,
        organization: data.organization,
        telegram: data.telegram,
        discord: data.discord,
      },
    });
    return team;
  }

  async findAll(query: FindQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? this.defaultPageSize);
    const totalCount = await this.prisma.team.count();
    const maximumPage = Math.max(1, Math.ceil(totalCount / limit));

    if (page > maximumPage || page < 1) {
      throw new BadRequestException('Page number is out of range');
    }

    const teams = await this.prisma.team.findMany({
      skip: Number(page - 1) * Number(limit),
      take: Number(limit),
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
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }
    return team;
  }

  async update(id: string, data: UpdateTeamDto) {
    await this.findOne(id);
    const isTheSameName = data.teamName === (await this.findOne(id)).teamName;
    if (isTheSameName) {
      throw new BadRequestException('Team with this name already exists');
    }
    const updatedTeam = await this.prisma.team.update({
      where: { id },
      data: {
        teamName: data.teamName,
        captainName: data.captainName,
        captainEmail: data.captainEmail,
        members: data.members,
        city: data.city,
        organization: data.organization,
        telegram: data.telegram,
        discord: data.discord,
      },
    });
    return updatedTeam;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deletedTeam = await this.prisma.team.delete({ where: { id } });
    return deletedTeam;
  }
}
