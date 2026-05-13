import { Test, TestingModule } from '@nestjs/testing';
import type { CreateTeamDto } from './dto/create-team.dto';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

describe('TeamController', () => {
  let controller: TeamController;
  const mockTeamService = {
    create: jest.fn(),
    join: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamController],
      providers: [
        {
          provide: TeamService,
          useValue: mockTeamService,
        },
      ],
    }).compile();

    controller = module.get<TeamController>(TeamController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create passes dto + current user email', async () => {
    mockTeamService.create.mockResolvedValue({ id: 'team-1' });
    const dto: CreateTeamDto = { name: 'Star', captainName: 'Olena' };
    await expect(controller.create(dto, 'e2e@example.com')).resolves.toEqual({
      id: 'team-1',
    });
    expect(mockTeamService.create).toHaveBeenCalledWith(dto, 'e2e@example.com');
  });

  it('join passes team id + current user email', async () => {
    mockTeamService.join.mockResolvedValue({ id: 'team-1' });
    await expect(controller.join('team-1', 'e2e@example.com')).resolves.toEqual(
      {
        id: 'team-1',
      },
    );
    expect(mockTeamService.join).toHaveBeenCalledWith(
      'team-1',
      'e2e@example.com',
    );
  });
});
