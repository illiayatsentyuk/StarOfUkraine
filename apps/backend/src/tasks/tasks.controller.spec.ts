import { Test, TestingModule } from '@nestjs/testing';
import type { CreateTournamentTasksDto } from './dto';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;

  const mockTasksService = {
    createTasks: jest.fn(),
    updateTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createTasks delegates to service', async () => {
    const dto: CreateTournamentTasksDto = {
      tasks: [
        {
          name: 'Round 1',
          description: '# Task',
          order: 1,
          criteria: { a: 1 },
        },
      ],
    };
    mockTasksService.createTasks.mockResolvedValue([{ id: 'task-1' }]);
    await expect(controller.createTasks('t-1', dto)).resolves.toEqual([
      { id: 'task-1' },
    ]);
    expect(mockTasksService.createTasks).toHaveBeenCalledWith('t-1', dto);
  });

  it('update delegates to service', async () => {
    const dto = { name: 'Updated' };
    mockTasksService.updateTask.mockResolvedValue({ id: 'task-1', name: 'Updated' });
    await expect(controller.update('task-1', dto)).resolves.toEqual({
      id: 'task-1',
      name: 'Updated',
    });
    expect(mockTasksService.updateTask).toHaveBeenCalledWith('task-1', dto);
  });
});
