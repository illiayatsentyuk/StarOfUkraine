import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SubmissionStatus, TaskStatus, TournamentStatus } from '@prisma/client';
import { getLoggerToken } from 'pino-nestjs';
import { PrismaService } from '../prisma/prisma.service';
import type { EvaluateSubmissionDto } from './dto';
import { TasksService } from './tasks.service';
import { JuryService } from '../jury/jury.service';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrisma = {
    tournament: {
      findUnique: jest.fn(),
    },
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) =>
      Promise.all(ops),
    ) as jest.MockedFunction<(ops: Promise<unknown>[]) => Promise<unknown[]>>,
    evaluation: {
      upsert: jest.fn(),
      count: jest.fn().mockResolvedValue(1),
    },
    team: {
      findFirst: jest.fn(),
    },
    submission: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
  };

  const tournamentMock = {
    id: 'tournament-1',
    name: 'Star of Ukraine Cup 2026',
    description: 'Open tournament for teams across Ukraine.',
    startDate: new Date('2026-04-01T12:00:00.000Z'),
    registrationStart: new Date('2026-03-20T00:00:00.000Z'),
    registrationEnd: new Date('2026-03-30T23:59:59.000Z'),
    maxTeams: 64,
    rounds: 6,
    teamSizeMin: 5,
    teamSizeMax: 7,
    status: TournamentStatus.DRAFT,
    hideTeamsUntilRegistrationEnds: true,
  };

  const mockPinoLogger = {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    setContext: jest.fn(),
    assign: jest.fn(),
  };

  const mockJuryService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: getLoggerToken(TasksService.name),
          useValue: mockPinoLogger,
        },
        {
          provide: JuryService,
          useValue: mockJuryService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTasks', () => {
    const dto = {
      tasks: [
        {
          name: 'Round 1',
          description: '# Desc',
          order: 1,
          criteria: { rubric: [] },
        },
      ],
    };

    it('creates tasks when tournament exists', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);
      mockPrisma.task.create.mockResolvedValue({
        id: 'task-1',
        tournamentId: tournamentMock.id,
        name: 'Round 1',
        description: '# Desc',
        order: 1,
        criteria: { rubric: [] },
      });

      const result = await service.createTasks(tournamentMock.id, dto);

      expect(result).toHaveLength(1);
      expect(mockPrisma.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: tournamentMock.id },
      });
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('throws when tournament not found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(null);

      await expect(service.createTasks('missing', dto)).rejects.toThrow(
        new NotFoundException('Tournament not found'),
      );
    });

    it('throws when order values duplicate', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);

      await expect(
        service.createTasks(tournamentMock.id, {
          tasks: [
            { ...dto.tasks[0], order: 1 },
            { ...dto.tasks[0], name: 'Round 2', order: 1 },
          ],
        }),
      ).rejects.toThrow(
        new BadRequestException('Task order values must be unique'),
      );
    });
  });

  describe('getTasksForTournament', () => {
    const taskRows = [
      {
        id: 'task-1',
        tournamentId: tournamentMock.id,
        name: 'Round 1',
        description: '# A',
        order: 1,
        criteria: { rubric: [] },
      },
      {
        id: 'task-2',
        tournamentId: tournamentMock.id,
        name: 'Round 2',
        description: '# B',
        order: 2,
        criteria: { rubric: [] },
      },
    ];

    it('returns tasks ordered by round when tournament exists', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentMock);
      mockPrisma.task.findMany.mockResolvedValue(taskRows);

      const result = await service.getTasksForTournament(tournamentMock.id);

      expect(result).toEqual(taskRows);
      expect(mockPrisma.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: tournamentMock.id },
      });
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { tournamentId: tournamentMock.id },
        orderBy: { order: 'asc' },
      });
    });

    it('throws when tournament not found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(null);

      await expect(service.getTasksForTournament('missing')).rejects.toThrow(
        new NotFoundException('Tournament not found'),
      );
      expect(mockPrisma.task.findMany).not.toHaveBeenCalled();
    });
  });

  describe('getTask', () => {
    const taskRow = {
      id: 'task-1',
      tournamentId: tournamentMock.id,
      name: 'Round 1',
      description: '# A',
      order: 1,
      criteria: { rubric: [] },
    };

    it('returns task when found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(taskRow);

      const result = await service.getTask('task-1');

      expect(result).toEqual(taskRow);
      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });

    it('throws when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.getTask('missing')).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
    });
  });

  describe('updateTask', () => {
    const taskRow = {
      id: 'task-1',
      tournamentId: tournamentMock.id,
      name: 'Round 1',
      description: '# Desc',
      order: 1,
      criteria: { rubric: [] },
    };

    it('updates when task exists', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(taskRow);
      mockPrisma.task.findFirst.mockResolvedValue(null);
      mockPrisma.task.update.mockResolvedValue({
        ...taskRow,
        name: 'Updated',
      });

      const result = await service.updateTask('task-1', { name: 'Updated' });

      expect(result.name).toBe('Updated');
      expect(mockPrisma.task.update).toHaveBeenCalled();
    });

    it('throws when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTask('missing', { name: 'X' }),
      ).rejects.toThrow(new NotFoundException('Task not found'));
    });

    it('throws when body empty', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(taskRow);

      await expect(service.updateTask('task-1', {})).rejects.toThrow(
        new BadRequestException('At least one field must be provided'),
      );
    });

    it('throws when order conflicts in tournament', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(taskRow);
      mockPrisma.task.findFirst.mockResolvedValue({
        id: 'other-task',
        order: 2,
      });

      await expect(service.updateTask('task-1', { order: 2 })).rejects.toThrow(
        new BadRequestException('Task order already used in this tournament'),
      );
    });
  });

  describe('activateTask', () => {
    it('sets ACTIVE when task is DRAFT', async () => {
      const activatedAt = new Date('2026-04-15T10:00:00.000Z');
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: TaskStatus.DRAFT,
        startsAt: null,
      });
      mockPrisma.task.update.mockResolvedValue({
        id: 'task-1',
        status: TaskStatus.ACTIVE,
        startsAt: activatedAt,
      });

      const result = await service.activateTask('task-1');

      expect(result.status).toBe(TaskStatus.ACTIVE);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        data: { status: TaskStatus.ACTIVE, startsAt: expect.any(Date) },
      });
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { taskId: 'task-1' },
        'Task activated',
      );
    });

    it('throws when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.activateTask('missing')).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
    });

    it('throws when task is not DRAFT', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: TaskStatus.ACTIVE,
      });

      await expect(service.activateTask('task-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('closeSubmissions', () => {
    it('sets SUBMISSION_CLOSED when task is ACTIVE', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: TaskStatus.ACTIVE,
      });
      mockPrisma.task.update.mockResolvedValue({
        id: 'task-1',
        status: TaskStatus.SUBMISSION_CLOSED,
      });

      const result = await service.closeSubmissions('task-1');

      expect(result.status).toBe(TaskStatus.SUBMISSION_CLOSED);
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        { taskId: 'task-1' },
        'Task submissions closed',
      );
    });

    it('throws when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.closeSubmissions('missing')).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
    });

    it('throws when task is not ACTIVE', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 'task-1',
        status: TaskStatus.DRAFT,
      });

      await expect(service.closeSubmissions('task-1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('submitTask', () => {
    const taskRow = {
      id: 'task-1',
      tournamentId: tournamentMock.id,
      name: 'Round 1',
      description: '# Desc',
      order: 1,
      status: TaskStatus.ACTIVE,
      deadline: null,
      criteria: { rubric: [] },
    };

    const submitDto = {
      teamId: 'team-1',
      githubUrl: 'https://github.com/o/r',
      videoUrl: 'https://youtu.be/x',
    };

    it('upserts submission when task and team in tournament exist', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(taskRow);
      mockPrisma.team.findFirst.mockResolvedValue({ id: 'team-1' });
      mockPrisma.submission.findUnique.mockResolvedValue(null);
      mockPrisma.submission.upsert.mockResolvedValue({
        id: 'sub-1',
        taskId: 'task-1',
        ...submitDto,
        status: SubmissionStatus.PENDING,
      });

      const result = await service.submitTask('task-1', submitDto);

      expect(result.id).toBe('sub-1');
      expect(mockPrisma.submission.upsert).toHaveBeenCalled();
    });

    it('throws when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.submitTask('missing', submitDto)).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
    });

    it('throws when team not in tournament', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(taskRow);
      mockPrisma.team.findFirst.mockResolvedValue(null);

      await expect(service.submitTask('task-1', submitDto)).rejects.toThrow(
        new BadRequestException('Team is not registered for this tournament'),
      );
    });

    it('throws when submission already evaluated', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(taskRow);
      mockPrisma.team.findFirst.mockResolvedValue({ id: 'team-1' });
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 'sub-1',
        status: SubmissionStatus.EVALUATED,
      });

      await expect(service.submitTask('task-1', submitDto)).rejects.toThrow(
        new BadRequestException('Submission is already fully evaluated'),
      );
    });

    it('throws when task is not ACTIVE', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        ...taskRow,
        status: TaskStatus.DRAFT,
      });

      await expect(service.submitTask('task-1', submitDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws when deadline has passed', async () => {
      mockPrisma.task.findUnique.mockResolvedValue({
        ...taskRow,
        deadline: new Date(Date.now() - 60_000),
      });
      mockPrisma.team.findFirst.mockResolvedValue({ id: 'team-1' });

      await expect(service.submitTask('task-1', submitDto)).rejects.toThrow(
        new BadRequestException('Submission deadline has passed'),
      );
    });
  });

  describe('getSubmissionsForTask', () => {
    const taskRow = {
      id: 'task-1',
      tournamentId: tournamentMock.id,
      name: 'Round 1',
      description: '# Desc',
      order: 1,
      criteria: { rubric: [] },
    };

    it('returns submissions with teams when task exists', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(taskRow);
      const rows = [
        {
          id: 'sub-1',
          taskId: 'task-1',
          teamId: 'team-1',
          githubUrl: 'https://github.com/a/b',
          videoUrl: 'https://youtu.be/x',
          status: SubmissionStatus.PENDING,
          team: {
            id: 'team-1',
            name: 'Team A',
            captainName: 'Cap',
            captainEmail: 'c@x.com',
            city: 'Kyiv',
            organization: null,
          },
        },
      ];
      mockPrisma.submission.findMany.mockResolvedValue(rows);

      const result = await service.getSubmissionsForTask('task-1');

      expect(result).toEqual(rows);
      expect(mockPrisma.submission.findMany).toHaveBeenCalledWith({
        where: { taskId: 'task-1' },
        orderBy: { id: 'asc' },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              captainName: true,
              captainEmail: true,
              city: true,
              organization: true,
            },
          },
        },
      });
    });

    it('throws when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(service.getSubmissionsForTask('missing')).rejects.toThrow(
        new NotFoundException('Task not found'),
      );
    });
  });

  describe('evaluateSubmission', () => {
    const userId = 'user-1';
    const juryRow = { id: 'jury-1', userId };

    const dto: EvaluateSubmissionDto = {
      scores: [
        { id: 'functionality', points: 35 },
        { id: 'code', points: 25 },
      ],
      comment: 'ok',
    };

    it('upserts evaluation and marks submission EVALUATED when minJuryPerSubmission reached', async () => {
      mockJuryService.findOne.mockResolvedValue(juryRow);
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 'sub-1',
        assignments: [],
        task: {
          criteria: {
            rubric: [
              { id: 'functionality', maxPoints: 40 },
              { id: 'code', maxPoints: 30 },
            ],
          },
          tournamentId: 'tournament-1',
          status: 'SUBMISSION_CLOSED',
        },
      });
      mockPrisma.evaluation.upsert.mockResolvedValue({ id: 'eval-1' });
      mockPrisma.tournament.findUnique.mockResolvedValue({
        id: 'tournament-1',
        minJuryPerSubmission: 1,
      });
      mockPrisma.evaluation.count.mockResolvedValue(1);
      mockPrisma.submission.update.mockResolvedValue({
        id: 'sub-1',
        status: SubmissionStatus.EVALUATED,
      });

      const result = await service.evaluateSubmission('sub-1', userId, dto);

      expect(result).toEqual({ id: 'eval-1' });
      expect(mockPrisma.evaluation.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            submissionId_juryId: { submissionId: 'sub-1', juryId: 'jury-1' },
          },
        }),
      );
      expect(mockPrisma.submission.update).toHaveBeenCalledWith({
        where: { id: 'sub-1' },
        data: { status: SubmissionStatus.EVALUATED },
      });
    });

    it('throws when jury profile not found', async () => {
      mockJuryService.findOne.mockResolvedValue(null);

      await expect(
        service.evaluateSubmission('sub-1', userId, dto),
      ).rejects.toThrow(new BadRequestException('Jury profile not found'));
    });

    it('throws when rubric score exceeds maxPoints', async () => {
      mockJuryService.findOne.mockResolvedValue(juryRow);
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 'sub-1',
        assignments: [],
        task: {
          criteria: {
            rubric: [{ id: 'code', maxPoints: 10 }],
          },
          tournamentId: 'tournament-1',
          status: 'SUBMISSION_CLOSED',
        },
      });

      await expect(
        service.evaluateSubmission('sub-1', userId, {
          scores: [{ id: 'code', points: 11 }],
          comment: 'x',
        } satisfies EvaluateSubmissionDto),
      ).rejects.toThrow(
        new BadRequestException('Points for "code" exceed maxPoints (11 > 10)'),
      );
    });

    it('throws when task is still ACTIVE', async () => {
      mockJuryService.findOne.mockResolvedValue(juryRow);
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 'sub-1',
        assignments: [],
        task: {
          criteria: {
            rubric: [{ id: 'code', maxPoints: 10 }],
          },
          tournamentId: 'tournament-1',
          status: TaskStatus.ACTIVE,
        },
      });

      await expect(
        service.evaluateSubmission('sub-1', userId, dto),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when jury is not assigned to submission', async () => {
      mockJuryService.findOne.mockResolvedValue(juryRow);
      mockPrisma.submission.findUnique.mockResolvedValue({
        id: 'sub-1',
        assignments: [{ juryId: 'other-jury' }],
        task: {
          criteria: {
            rubric: [
              { id: 'functionality', maxPoints: 40 },
              { id: 'code', maxPoints: 30 },
            ],
          },
          tournamentId: 'tournament-1',
          status: TaskStatus.SUBMISSION_CLOSED,
        },
      });

      await expect(service.evaluateSubmission('sub-1', userId, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
