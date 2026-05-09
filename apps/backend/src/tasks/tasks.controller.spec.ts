import { Test, TestingModule } from '@nestjs/testing';
import type { CreateTournamentTasksDto } from './dto';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
  let controller: TasksController;

  const mockTasksService = {
    createTasks: jest.fn(),
    getTasksForTournament: jest.fn(),
    updateTask: jest.fn(),
    submitTask: jest.fn(),
    getSubmissionsForTask: jest.fn(),
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

  it('getTasksForTournament delegates to service', async () => {
    const tasks = [{ id: 'task-1', order: 1 }];
    mockTasksService.getTasksForTournament.mockResolvedValue(tasks);
    await expect(controller.getTasksForTournament('t-1')).resolves.toEqual(
      tasks,
    );
    expect(mockTasksService.getTasksForTournament).toHaveBeenCalledWith('t-1');
  });

  it('update delegates to service', async () => {
    const dto = { name: 'Updated' };
    mockTasksService.updateTask.mockResolvedValue({
      id: 'task-1',
      name: 'Updated',
    });
    await expect(controller.update('task-1', dto)).resolves.toEqual({
      id: 'task-1',
      name: 'Updated',
    });
    expect(mockTasksService.updateTask).toHaveBeenCalledWith('task-1', dto);
  });

  it('submit delegates to service', async () => {
    const dto = {
      teamId: 'team-1',
      githubUrl: 'https://github.com/a/b',
      videoUrl: 'https://youtu.be/x',
    };
    mockTasksService.submitTask.mockResolvedValue({ id: 'sub-1' });
    await expect(controller.submit('task-1', dto)).resolves.toEqual({
      id: 'sub-1',
    });
    expect(mockTasksService.submitTask).toHaveBeenCalledWith('task-1', dto);
  });

  it('getSubmissions delegates to service', async () => {
    const list = [{ id: 'sub-1', team: { name: 'T' } }];
    mockTasksService.getSubmissionsForTask.mockResolvedValue(list);
    await expect(controller.getSubmissions('task-1')).resolves.toEqual(list);
    expect(mockTasksService.getSubmissionsForTask).toHaveBeenCalledWith(
      'task-1',
    );
  });
});
