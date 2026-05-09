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
import { authExamples, usersExamples } from '../examples';
import { Serialize } from '../interceptors/serialize.interceptor';
import { FindUsersDto, UserDto } from './dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@Controller('users')
@Serialize(UserDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  findOne(@Param('id') identifier: string) {
    return this.usersService.findOne(identifier);
  }
}
