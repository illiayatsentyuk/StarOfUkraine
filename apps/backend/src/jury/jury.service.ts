import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'pino-nestjs';
import { Role } from 'src/enum';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import type { AddToJuryDto, AssignJuryDto } from './dto';

@Injectable()
export class JuryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    @InjectPinoLogger(JuryService.name)
    private readonly logger: PinoLogger,
  ) {}

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

    if (!user) throw new NotFoundException('User not found');
    if (!jury) throw new NotFoundException('Jury not found');

    if (user.role !== Role.ADMIN && jury.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to remove a jury from this tournament',
      );
    }

    await this.prisma.jury.delete({ where: { id } });
    return { message: 'Jury removed successfully' };
  }

  async assignJury(tournamentId: string, dto: AssignJuryDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        minJuryPerSubmission: true,
        jurors: { select: { id: true } },
        tasks: {
          select: {
            submissions: { select: { id: true } },
          },
        },
      },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    const jurorIds = tournament.jurors.map((j) => j.id);
    if (jurorIds.length === 0) {
      throw new BadRequestException(
        'No jury members assigned to this tournament',
      );
    }

    const submissionIds = tournament.tasks.flatMap((t) =>
      t.submissions.map((s) => s.id),
    );
    if (submissionIds.length === 0) {
      throw new BadRequestException('No submissions found for this tournament');
    }

    const pairs = buildAssignments(
      submissionIds,
      jurorIds,
      dto.submissionsPerJury,
      tournament.minJuryPerSubmission,
    );

    await this.prisma.$transaction([
      this.prisma.submissionAssignment.deleteMany({
        where: {
          submission: { task: { tournamentId } },
        },
      }),
      ...pairs.map(({ submissionId, juryId }) =>
        this.prisma.submissionAssignment.create({
          data: { submissionId, juryId },
        }),
      ),
    ]);

    this.logger.info(
      {
        tournamentId,
        submissionsCount: submissionIds.length,
        juryCount: jurorIds.length,
        assignmentsCreated: pairs.length,
      },
      'Jury assignments created',
    );

    return {
      assignmentsCreated: pairs.length,
      submissionsCount: submissionIds.length,
      juryCount: jurorIds.length,
    };
  }

  private addJuryToTournament(juryId: string, tournamentId: string) {
    return this.prisma.jury.update({
      where: { id: juryId },
      data: { tournaments: { connect: { id: tournamentId } } },
    });
  }

  private async createJury(userId: string, tournamentId: string) {
    const user = await this.usersService.updateRole(userId, Role.JURY);
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.jury.create({
      data: { userId, tournaments: { connect: { id: tournamentId } } },
    });
  }
}

function buildAssignments(
  submissionIds: string[],
  jurorIds: string[],
  submissionsPerJury: number,
  minPerSubmission: number,
): Array<{ submissionId: string; juryId: string }> {
  const subs = shuffle([...submissionIds]);
  const jury = shuffle([...jurorIds]);

  const jurorSlots = new Map<string, number>(
    jury.map((id) => [id, submissionsPerJury]),
  );

  const coverage = new Map<string, number>(subs.map((id) => [id, 0]));

  const pairs = new Set<string>();
  const result: Array<{ submissionId: string; juryId: string }> = [];

  const addPair = (submissionId: string, juryId: string) => {
    const key = `${submissionId}|${juryId}`;
    if (pairs.has(key)) return false;
    pairs.add(key);
    result.push({ submissionId, juryId });
    jurorSlots.set(juryId, (jurorSlots.get(juryId) ?? 0) - 1);
    coverage.set(submissionId, (coverage.get(submissionId) ?? 0) + 1);
    return true;
  };

  for (const subId of subs) {
    let assigned = coverage.get(subId) ?? 0;
    const availableJury = shuffle(
      jury.filter(
        (jId) =>
          (jurorSlots.get(jId) ?? 0) > 0 && !pairs.has(`${subId}|${jId}`),
      ),
    );
    for (const jId of availableJury) {
      if (assigned >= minPerSubmission) break;
      if (addPair(subId, jId)) assigned++;
    }
  }

  for (const jId of jury) {
    const remaining = jurorSlots.get(jId) ?? 0;
    if (remaining <= 0) continue;

    const candidates = shuffle(
      subs.filter((sId) => !pairs.has(`${sId}|${jId}`)),
    ).sort((a, b) => (coverage.get(a) ?? 0) - (coverage.get(b) ?? 0));

    for (const subId of candidates) {
      if ((jurorSlots.get(jId) ?? 0) <= 0) break;
      addPair(subId, jId);
    }
  }

  return result;
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
