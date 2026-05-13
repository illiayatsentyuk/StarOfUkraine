import { CacheModule } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import type { JoinTournamentDto } from './dto/join-tournament.dto';
import { TournamentController } from './tournament.controller';
import { TournamentService } from './tournament.service';

describe('TournamentController', () => {
  let controller: TournamentController;
  const mockTournamentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    joinTournament: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [TournamentController],
      providers: [
        {
          provide: TournamentService,
          useValue: mockTournamentService,
        },
      ],
    }).compile();

    controller = module.get<TournamentController>(TournamentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('joinTournament delegates to service', async () => {
    mockTournamentService.joinTournament.mockResolvedValue({ id: 't-1' });
    const dto: JoinTournamentDto = { teamId: 'team-1' };
    await expect(controller.joinTournament('t-1', dto)).resolves.toEqual({
      id: 't-1',
    });
    expect(mockTournamentService.joinTournament).toHaveBeenCalledWith('t-1', {
      teamId: 'team-1',
    });
  });
});
