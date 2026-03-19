import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTeamDto) {
    return this.prisma.team.create({
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
  }

  findAll() {
    return this.prisma.team.findMany();
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
    return this.prisma.team.update({
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
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.team.delete({ where: { id } });
  }
}
