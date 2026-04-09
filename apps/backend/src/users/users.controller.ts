import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { FindUsersDto, UserDto } from './dto';
import { Serialize } from '../interceptors/serialize.interceptor';

@Controller('users')
@Serialize(UserDto)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get('search')
    findUsers(@Query() query: FindUsersDto) {
        return this.usersService.findUsers(query);
    }

    @Get(':id')
    findOne(@Param('id') identifier: string) {
        return this.usersService.findOne(identifier);
    }
}
