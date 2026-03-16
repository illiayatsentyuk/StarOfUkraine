import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentController {
  constructor(private readonly tournamentService: TournamentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiResponse({ status: 201, description: 'Tournament successfully created' })
  create(@Body() data: CreateTournamentDto) {
    return this.tournamentService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all tournaments' })
  @ApiResponse({ status: 200, description: 'List of tournaments returned' })
  findAll() {
    return this.tournamentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tournament by id' })
  @ApiResponse({ status: 200, description: 'Tournament returned' })
  findOne(@Param('id') id: string) {
    return this.tournamentService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tournament by id' })
  @ApiResponse({ status: 200, description: 'Tournament successfully updated' })
  update(@Param('id') id: string, @Body() data: UpdateTournamentDto) {
    return this.tournamentService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tournament by id' })
  @ApiResponse({ status: 200, description: 'Tournament successfully deleted' })
  remove(@Param('id') id: string) {
    return this.tournamentService.remove(id);
  }
}

