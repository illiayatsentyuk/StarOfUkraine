import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    findAll() {
        return this.prisma.user.findMany({});
    }

    async findOne(identifier: string) {
        const trimmed = identifier.trim();
        const normalizedEmail = trimmed.toLowerCase();

        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedEmail },
                    { nameId: trimmed },
                ],
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
