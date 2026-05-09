import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddToJuryDto } from './dto';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/enum';

@Injectable()
export class JuryService {
    constructor(private readonly prisma: PrismaService, private readonly usersService: UsersService) {}

    findAll() {
        return this.prisma.jury.findMany();
    }

    findOne(id: string) {
        return this.prisma.jury.findUnique({ where: { userId: id } });
    }

    async addToJury(body: AddToJuryDto) {
        const { tournamentId, userId } = body;

        const jury = await this.findOne(userId);

        if (!jury) {
            return this.createJury(userId, tournamentId);
        }

        return this.addJuryToTournament(jury.id, tournamentId);
    }

    async removeFromJury(id: string, userId: string) {
        const jury = await this.prisma.jury.findUnique({ where: { id } });
        const user = await this.usersService.findOne(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!jury) {
            throw new NotFoundException('Jury not found');
        }

        if(user.role !== Role.ADMIN && jury.userId !== userId) {
            throw new ForbiddenException('You are not authorized to remove a jury from this tournament');
        }

        await this.prisma.jury.delete({ where: { id } });

        return { message: 'Jury removed successfully' };
    }

    private async addJuryToTournament(juryId: string, tournamentId: string) {
        return this.prisma.jury.update({ where: { id: juryId }, data: { tournaments: { connect: { id: tournamentId } } } });
    }

    private async createJury(userId: string, tournamentId: string) {
        const user = await this.usersService.updateRole(userId, Role.JURY);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.prisma.jury.create({ data: { userId, tournaments: { connect: { id: tournamentId } } } });
    }
}
