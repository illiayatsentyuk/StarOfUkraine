import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { FindQueryDto } from '../common/dto/find-query.dto';
import { SortBy, SortOrder } from '../enum';

@Injectable()
export class TournamentService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly defaultPageSize = Number(process.env.PAGE_SIZE) || 10;

  async create(data: CreateTournamentDto) {
    const existingTournament = await this.prisma.tournament.findFirst({
      where: {
        name: data.name,
      },
    });
    if (existingTournament) {
      throw new BadRequestException('Tournament already exists');
    }
    const tournament = await this.prisma.tournament.create({
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
    return tournament;
  }

  async findAll(query: FindQueryDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? this.defaultPageSize);
    const totalCount = await this.prisma.tournament.count();
    const maximumPage = Math.max(1, Math.ceil(totalCount / limit));

    if (page > maximumPage || page < 1) {
      throw new BadRequestException('Page number is out of range');
    }

    const sortBy = query.sortBy ?? SortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    const tournaments = await this.prisma.tournament.findMany({
      skip: Number(page - 1) * Number(limit),
      take: Number(limit),
      orderBy: {
        [sortBy]: sortOrder === SortOrder.ASC ? 'asc' : 'desc',
      },
    });

    return {
      data: tournaments,
      currentPage: Number(page),
      nextPage: page < maximumPage ? Number(page) + 1 : null,
      previousPage: page > 1 ? Number(page) - 1 : null,
      totalPages: Number(maximumPage),
      itemsPerPage: Number(limit),
    };
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  async update(id: string, data: UpdateTournamentDto) {
    await this.findOne(id);
    const isTheSameName = data.name === (await this.findOne(id)).name;
    if (isTheSameName) {
      throw new BadRequestException('Tournament with this name already exists');
    }
    const updatedTournament = await this.prisma.tournament.update({
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
        hideTeamsUntilRegistrationEnds: data.hideTeamsUntilRegistrationEnds,
      },
    });
    return updatedTournament;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tournament.delete({ where: { id } });
  }
}
