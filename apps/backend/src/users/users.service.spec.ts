import { Test, TestingModule } from '@nestjs/testing';
import { getLoggerToken } from 'pino-nestjs';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: { user: { findMany: jest.Mock; findFirst: jest.Mock } };

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
    mockPrisma = {
      user: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: getLoggerToken(UsersService.name),
          useValue: mockPinoLogger,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findUsers', () => {
    it('returns all users matching query (email/nameId, insensitive)', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'u1' }]);

      const result = await service.findUsers({ query: '  OLEna  ' });

      expect(result).toEqual([{ id: 'u1' }]);
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'OLEna', mode: 'insensitive' } },
            { nameId: { contains: 'OLEna', mode: 'insensitive' } },
          ],
        },
      });
    });
  });
});
