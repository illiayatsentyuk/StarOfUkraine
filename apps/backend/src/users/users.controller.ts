import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user';
import { Serialize } from '../interceptors/serialize.interceptor';

@Controller('users')
@Serialize(UserDto)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') identifier: string) {
        return this.usersService.findOne(identifier);
    }
}
