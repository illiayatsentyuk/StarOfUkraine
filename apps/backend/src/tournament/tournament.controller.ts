import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators';
import { Role } from 'src/enum';
import { Public } from '../common/decorators';
import { authExamples, tournamentExamples } from '../examples';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { FindTournamentQueryDto } from './dto/find-tournament-query.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentService } from './tournament.service';
import { JoinTournamentDto } from './dto/join-tournament.dto';

@ApiTags('Tournaments')
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
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all tournaments' })
  @ApiBody({ type: FindTournamentQueryDto })
  @ApiResponse({
    status: 200,
    description: 'List of tournaments returned',
    schema: { example: tournamentExamples.paginatedResponse },
  })
  @ApiResponse({ status: 400, description: 'Page number is out of range' })
  findAll(@Body() body: FindTournamentQueryDto) {
    return this.tournamentService.findAll(body);
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

  @Patch("join/:id")
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
