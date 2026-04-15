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
import { GetCurrentUser, Public } from '../common/decorators';
import { authExamples, teamExamples } from '../examples';
import { CreateTeamDto } from './dto/create-team.dto';
import { FindTeamQueryDto } from './dto/find-team-query.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamService } from './team.service';

@ApiTags('Teams')
@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
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
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires USER role' })
  create(@Body() data: CreateTeamDto, @GetCurrentUser('email') email: string) {
    return this.teamService.create(data, email);
  }

  @Post(':id/join')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiOperation({ summary: 'Join a team (current user)' })
  @ApiResponse({
    status: 200,
    description: 'Joined team',
    schema: { example: teamExamples.response },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 400, description: 'User is already a team member' })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  join(@Param('id') id: string, @GetCurrentUser('email') email: string) {
    return this.teamService.join(id, email);
  }

  @Public()
  @Post('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all teams' })
  @ApiBody({ type: FindTeamQueryDto })
  @ApiResponse({
    status: 200,
    description: 'List of teams returned',
    schema: { example: teamExamples.paginatedResponse },
  })
  @ApiResponse({ status: 400, description: 'Page number is out of range' })
  findAll(@Body() body: FindTeamQueryDto) {
    return this.teamService.findAll(body);
  }

  @Public()
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
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
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
  @ApiResponse({
    status: 400,
    description: 'Team with this name already exists',
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires USER role' })
  update(@Param('id') id: string, @Body() data: UpdateTeamDto) {
    return this.teamService.update(id, data);
  }

  @Delete(':id')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Team ID' })
  @ApiOperation({ summary: 'Delete a team by id' })
  @ApiResponse({
    status: 200,
    description: 'Team successfully deleted',
    schema: { example: teamExamples.response },
  })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires USER role' })
  remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}
