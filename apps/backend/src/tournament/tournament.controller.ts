import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { tournamentExamples } from '../examples';
import { Public } from '../common/decorators';
import { FindQueryDto } from '../common/dto/find-query.dto';

@Public()
@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
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
  create(@Body() data: CreateTournamentDto) {
    return this.tournamentService.create(data);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all tournaments' })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (defaults to PAGE_SIZE env var)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'List of tournaments returned',
    schema: { example: tournamentExamples.paginatedResponse },
  })
  @ApiResponse({ status: 400, description: 'Page number is out of range' })
  findAll(@Query() query: FindQueryDto) {
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

  @Patch(':id')
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
  update(@Param('id') id: string, @Body() data: UpdateTournamentDto) {
    return this.tournamentService.update(id, data);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({ summary: 'Delete a tournament by id' })
  @ApiResponse({
    status: 200,
    description: 'Tournament successfully deleted',
    schema: { example: tournamentExamples.response },
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }
}
