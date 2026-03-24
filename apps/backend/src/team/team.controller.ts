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
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { teamExamples } from '../examples/team/team.examples';
import { Public } from '../common/decorators/public.decorator';
import { FindQueryDto } from '../common/dto/find-query.dto';

@Public()
@ApiTags('Teams')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiBody({
    type: CreateTeamDto,
    examples: {
      create: { value: teamExamples.createRequest },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Team successfully created',
    schema: { example: teamExamples.response },
  })
  @ApiResponse({ status: 400, description: 'Team already exists' })
  create(@Body() data: CreateTeamDto) {
    return this.teamService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'List all teams' })
  @ApiResponse({
    status: 200,
    description: 'List of teams returned',
    schema: { example: [teamExamples.response] },
  })
  findAll(@Query() query: FindQueryDto) {
    return this.teamService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiOperation({ summary: 'Get a team by id' })
  @ApiResponse({
    status: 200,
    description: 'Team returned',
    schema: { example: teamExamples.response },
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  findOne(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiOperation({ summary: 'Update a team by id' })
  @ApiBody({
    type: UpdateTeamDto,
    examples: {
      update: { value: teamExamples.createRequest },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Team successfully updated',
    schema: { example: teamExamples.response },
  })
  @ApiResponse({ status: 400, description: 'Team with this name already exists' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  update(@Param('id') id: string, @Body() data: UpdateTeamDto) {
    return this.teamService.update(id, data);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiOperation({ summary: 'Delete a team by id' })
  @ApiResponse({
    status: 200,
    description: 'Team successfully deleted',
    schema: { example: teamExamples.response },
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}
