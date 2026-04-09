import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { FindUsersDto, UserDto } from './dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { usersExamples } from '../examples';

@ApiTags('Users')
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
    findOne(@Param('id') identifier: string) {
        return this.usersService.findOne(identifier);
    }
}
