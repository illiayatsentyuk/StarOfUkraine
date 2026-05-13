import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'pino-nestjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JuryService } from './jury.service';

describe('JuryService', () => {
  let service: JuryService;

  const mockPrisma = {
    jury: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tournament: {
      findUnique: jest.fn(),
    },
    submissionAssignment: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({ id: 'ass-1' }),
    },
    $transaction: jest.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  };

  const mockUsersService = {
    findOne: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JuryService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
        { provide: getLoggerToken(JuryService.name), useValue: mockPinoLogger },
      ],
    }).compile();

    service = module.get<JuryService>(JuryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignJury', () => {
    const tournamentId = 't-1';
    const tournamentShape = {
      id: tournamentId,
      minJuryPerSubmission: 1,
      jurors: [{ id: 'j1' }, { id: 'j2' }],
      tasks: [
        {
          submissions: [{ id: 's1' }, { id: 's2' }],
        },
      ],
    };

    it('clears previous assignments and creates new pairs', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(tournamentShape);

      const result = await service.assignJury(tournamentId, {
        submissionsPerJury: 4,
      });

      expect(result.submissionsCount).toBe(2);
      expect(result.juryCount).toBe(2);
      expect(result.assignmentsCreated).toBeGreaterThan(0);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.submissionAssignment.deleteMany).toHaveBeenCalled();
      expect(mockPinoLogger.info).toHaveBeenCalledWith(
        {
          tournamentId,
          submissionsCount: 2,
          juryCount: 2,
          assignmentsCreated: result.assignmentsCreated,
        },
        'Jury assignments created',
      );
    });

    it('throws when tournament not found', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue(null);

      await expect(
        service.assignJury('missing', { submissionsPerJury: 2 }),
      ).rejects.toThrow(new NotFoundException('Tournament not found'));
    });

    it('throws when no jury on tournament', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        ...tournamentShape,
        jurors: [],
      });

      await expect(
        service.assignJury(tournamentId, { submissionsPerJury: 2 }),
      ).rejects.toThrow(
        new BadRequestException('No jury members assigned to this tournament'),
      );
    });

    it('throws when there are no submissions', async () => {
      mockPrisma.tournament.findUnique.mockResolvedValue({
        ...tournamentShape,
        tasks: [{ submissions: [] }],
      });

      await expect(
        service.assignJury(tournamentId, { submissionsPerJury: 2 }),
      ).rejects.toThrow(
        new BadRequestException('No submissions found for this tournament'),
      );
    });
  });
});
