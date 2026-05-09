import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { PrismaService } from '../prisma/prisma.service';
import { FindUsersDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(UsersService.name)
    private readonly logger: PinoLogger,
  ) {}

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
    this.logger.debug({ userId: user.id }, 'User resolved by identifier');
    return user;
  }

  findUsers(dto: FindUsersDto) {
    const q = dto.query.trim();
    this.logger.debug({ queryLength: q.length }, 'User search');
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
