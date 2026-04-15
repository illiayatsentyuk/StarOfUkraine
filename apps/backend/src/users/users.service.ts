import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FindUsersDto } from './dto';

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
        OR: [{ email: normalizedEmail }, { nameId: trimmed }],
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  findUsers(dto: FindUsersDto) {
    const q = dto.query.trim();
    return this.prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { nameId: { contains: q, mode: 'insensitive' } },
        ],
      },
    });
  }
}
