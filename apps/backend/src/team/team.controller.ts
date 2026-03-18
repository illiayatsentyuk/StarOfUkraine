import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Teams')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiResponse({ status: 201, description: 'Team successfully created' })
  create(@Body() data: CreateTeamDto) {
    return this.teamService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all teams' })
  @ApiResponse({ status: 200, description: 'List of teams returned' })
  findAll() {
    return this.teamService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by id' })
  @ApiResponse({ status: 200, description: 'Team returned' })
  findOne(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team by id' })
  @ApiResponse({ status: 200, description: 'Team successfully updated' })
  update(@Param('id') id: string, @Body() data: UpdateTeamDto) {
    return this.teamService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team by id' })
  @ApiResponse({ status: 200, description: 'Team successfully deleted' })
  remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}

