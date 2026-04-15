import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findUsers: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll delegates to service', async () => {
    mockUsersService.findAll.mockResolvedValue([{ id: 'u1' }]);
    await expect(controller.findAll()).resolves.toEqual([{ id: 'u1' }]);
  });

  it('findUsers delegates to service', async () => {
    mockUsersService.findUsers.mockResolvedValue([{ id: 'u1' }]);
    await expect(controller.findUsers({ query: 'olena' })).resolves.toEqual([
      { id: 'u1' },
    ]);
    expect(mockUsersService.findUsers).toHaveBeenCalledWith({ query: 'olena' });
  });

  it('findOne delegates to service', async () => {
    mockUsersService.findOne.mockResolvedValue({ id: 'u1' });
    await expect(controller.findOne('u1')).resolves.toEqual({ id: 'u1' });
    expect(mockUsersService.findOne).toHaveBeenCalledWith('u1');
  });
});
