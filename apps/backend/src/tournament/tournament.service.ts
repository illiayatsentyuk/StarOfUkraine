import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateTournamentDto) {
    return this.prisma.tournament.create({
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        registrationStart: data.registrationStart,
        registrationEnd: data.registrationEnd,
        maxTeams: data.maxTeams,
        rounds: data.rounds,
        teamSizeMin: data.teamSizeMin,
        teamSizeMax: data.teamSizeMax,
        status: data.status,
        hideTeamsUntilRegistrationEnds:
          data.hideTeamsUntilRegistrationEnds ?? false,
      },
    });
  }

  findAll() {
    return this.prisma.tournament.findMany();
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({ where: { id } });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  async update(id: string, data: UpdateTournamentDto) {
    await this.findOne(id);
    return this.prisma.tournament.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        registrationStart: data.registrationStart,
        registrationEnd: data.registrationEnd,
        maxTeams: data.maxTeams,
        rounds: data.rounds,
        teamSizeMin: data.teamSizeMin,
        teamSizeMax: data.teamSizeMax,
        status: data.status,
        hideTeamsUntilRegistrationEnds:
          data.hideTeamsUntilRegistrationEnds,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tournament.delete({ where: { id } });
  }
}

