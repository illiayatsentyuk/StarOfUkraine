import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  findAll(query: FindQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? this.defaultPageSize;

    return this.prisma.team.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });
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
