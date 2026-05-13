import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUserId } from '../common/decorators';
import { authExamples, usersExamples } from '../examples';
import { Serialize } from '../interceptors/serialize.interceptor';
import { FindUsersDto, UserDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me/dashboard')
  @ApiOperation({
    summary: 'Get current user dashboard (active tournament, task, submission)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data for the current user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  getDashboard(@GetCurrentUserId() userId: string) {
    return this.usersService.getDashboard(userId);
  }

  @Get('me/history')
  @ApiOperation({
    summary: 'Get current user participation history (teams, tournaments, submissions)',
  })
  @ApiResponse({
    status: 200,
    description: 'Participation history for the current user',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  getHistory(@GetCurrentUserId() userId: string) {
    return this.usersService.getParticipationHistory(userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    schema: { example: [usersExamples.userResponse] },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @Serialize(UserDto)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search users by query' })
  @ApiQuery({
    name: 'query',
    required: true,
    description: 'Matches email, nameId (case-insensitive contains)',
    example: usersExamples.searchQuery.query,
  })
  @ApiResponse({
    status: 200,
    description: 'Matching users',
    schema: { example: usersExamples.searchResponse },
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @Serialize(UserDto)
  findUsers(@Query() query: FindUsersDto) {
    return this.usersService.findUsers(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by identifier' })
  @ApiParam({
    name: 'id',
    description: 'User id OR email OR nameId',
    example: usersExamples.userResponse.id,
  })
  @ApiResponse({
    status: 200,
    description: 'User',
    schema: { example: usersExamples.userResponse },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @Serialize(UserDto)
  findOne(@Param('id') identifier: string) {
    return this.usersService.findOne(identifier);
  }
}
