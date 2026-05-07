import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TournamentStatus } from '@prisma/client';
import { Roles } from 'src/common/decorators';
import { Role, SortOrder, TournamentsSortBy } from 'src/enum';
import { Public } from '../common/decorators';
import { authExamples, tournamentExamples } from '../examples';
import {
  CreateTournamentDto,
  FindTournamentQueryDto,
  JoinTournamentDto,
  LeaderboardRowDto,
  UpdateTournamentDto,
} from './dto';
import { TournamentService } from './tournament.service';

@ApiTags('Tournaments')
@UseInterceptors(CacheInterceptor)
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiBody({
    type: CreateTournamentDto,
    examples: {
      create: { value: tournamentExamples.createRequest },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tournament successfully created',
    schema: { example: tournamentExamples.response },
  })
  @ApiResponse({ status: 400, description: 'Tournament already exists' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires ADMIN role' })
  create(@Body() data: CreateTournamentDto) {
    return this.tournamentService.create(data);
  }

  @Public()
  @Get('list')
  @ApiOperation({ summary: 'List all tournaments' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    example: 1,
    description: 'Page number (1-based)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Items per page (defaults to PAGE_SIZE env var)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: TournamentsSortBy,
    description: 'Sort by',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by name (case-insensitive contains)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: TournamentStatus,
    description: 'Filter by tournament status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of tournaments returned',
    schema: { example: tournamentExamples.paginatedResponse },
  })
  @ApiResponse({ status: 400, description: 'Page number is out of range' })
  findAll(@Query() query: FindTournamentQueryDto) {
    return this.tournamentService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({ summary: 'Get a tournament by id' })
  @ApiResponse({
    status: 200,
    description: 'Tournament returned',
    schema: { example: tournamentExamples.response },
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }

  @Public()
  @Get(':id/leaderboard')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({
    summary:
      'Leaderboard: sum of jury average scores across all rounds per team',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard returned',
    type: LeaderboardRowDto,
    isArray: true,
    schema: { example: tournamentExamples.leaderboardResponse },
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  leaderboard(@Param('id') id: string) {
    return this.tournamentService.getLeaderboard(id);
  }

  @Patch('join/:id')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({ summary: 'Join tournament with a team' })
  @ApiBody({
    type: JoinTournamentDto,
    examples: {
      join: { value: { teamId: 'team-1' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tournament updated (team connected)',
    schema: { example: tournamentExamples.response },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Tournament or team not found' })
  joinTournament(@Param('id') id: string, @Body() data: JoinTournamentDto) {
    return this.tournamentService.joinTournament(id, data);
  }

  @Patch(':id')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({ summary: 'Update a tournament by id' })
  @ApiBody({
    type: UpdateTournamentDto,
    examples: {
      update: { value: tournamentExamples.createRequest },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Tournament successfully updated',
    schema: { example: tournamentExamples.response },
  })
  @ApiResponse({
    status: 400,
    description: 'Tournament with this name already exists',
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires ADMIN role' })
  update(@Param('id') id: string, @Body() data: UpdateTournamentDto) {
    return this.tournamentService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({ summary: 'Delete a tournament by id' })
  @ApiResponse({
    status: 200,
    description: 'Tournament successfully deleted',
    schema: { example: tournamentExamples.response },
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires ADMIN role' })
  remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }
}
