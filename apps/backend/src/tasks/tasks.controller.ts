import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators';
import { Role } from 'src/enum';
import { authExamples, tasksExamples } from '../examples';
import { CreateTournamentTasksDto, UpdateTaskDto } from './dto';
import { TasksService } from './tasks.service';

/** Повні шляхи в декораторах: `POST /tournaments/:id/tasks`, `PATCH /tasks/:id`. */
@ApiTags('Tournaments', 'Tasks')
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('tournaments/:id/tasks')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({
    summary: 'Create tournament rounds (tasks) and scoring criteria',
  })
  @ApiBody({
    type: CreateTournamentTasksDto,
    examples: {
      tasks: { value: tasksExamples.createTasksRequest },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tasks created',
    schema: {
      example: [tasksExamples.taskResponse],
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid body or duplicate order' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  createTasks(
    @Param('id') id: string,
    @Body() data: CreateTournamentTasksDto,
  ) {
    return this.tasksService.createTasks(id, data);
  }

  @Patch('tournaments/:id/tasks/:id')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({
    summary: 'Update an existing task (round) and scoring criteria',
  })
  @ApiBody({
    type: UpdateTaskDto,
    examples: {
      update: { value: tasksExamples.updateTaskRequest },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Task updated',
    schema: { example: tasksExamples.taskResponse },
  })
  @ApiResponse({
    status: 400,
    description: 'Empty body or duplicate order in tournament',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  update(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    return this.tasksService.updateTask(id, data);
  }
}
