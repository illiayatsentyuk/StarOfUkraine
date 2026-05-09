import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/common/decorators';
import { Role } from 'src/enum';
import { GetCurrentUserId } from '../common/decorators/get-current-user-id.decorator';
import { authExamples, tasksExamples } from '../examples';
import { Serialize } from '../interceptors/serialize.interceptor';
import {
  CreateTournamentTasksDto,
  EvaluateSubmissionDto,
  SubmissionListItemDto,
  SubmissionTeamSummaryDto,
  SubmitTaskDto,
  UpdateTaskDto,
} from './dto';
import { TasksService } from './tasks.service';

/**
 * Task-scoped routes use full paths on `@Controller()`:
 * `GET|POST /tournaments/:id/tasks`, `GET /tasks/:id`, `PATCH /tasks/:id`, `POST /tasks/:id/submit`, `GET /tasks/:id/submissions`.
 */
@ApiTags('Tournaments', 'Tasks')
@ApiExtraModels(SubmissionListItemDto, SubmissionTeamSummaryDto)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('tournaments/:id/tasks')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({ summary: 'List tournament rounds (tasks) ordered by round' })
  @ApiOkResponse({
    description: 'Tasks for the tournament',
    schema: { example: tasksExamples.tasksListResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  @ApiForbiddenResponse({
    description: 'Forbidden — insufficient role (USER, JURY, or ADMIN)',
  })
  getTasksForTournament(@Param('id') id: string) {
    return this.tasksService.getTasksForTournament(id);
  }

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
  @ApiCreatedResponse({
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
  @ApiForbiddenResponse({
    description: 'Forbidden — insufficient role (USER, JURY, or ADMIN)',
  })
  createTasks(@Param('id') id: string, @Body() data: CreateTournamentTasksDto) {
    return this.tasksService.createTasks(id, data);
  }

  @Patch('tasks/:id')
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
  @ApiOkResponse({
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
  @ApiForbiddenResponse({
    description: 'Forbidden — insufficient role (USER, JURY, or ADMIN)',
  })
  update(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    return this.tasksService.updateTask(id, data);
  }

  @Get('tasks/:id')
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({ summary: 'Get a single task (round) by id' })
  @ApiOkResponse({
    description: 'Task returned',
    schema: { example: tasksExamples.taskResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiForbiddenResponse({
    description: 'Forbidden — insufficient role (USER, JURY, or ADMIN)',
  })
  getTask(@Param('id') id: string) {
    return this.tasksService.getTask(id);
  }

  @Post('tasks/:id/submit')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.USER, Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({
    summary: 'Submit GitHub and video links for a task (team submission)',
  })
  @ApiBody({
    type: SubmitTaskDto,
    examples: {
      submit: { value: tasksExamples.submitTaskRequest },
    },
  })
  @ApiOkResponse({
    description: 'Submission created or updated',
    schema: { example: tasksExamples.submissionResponse },
  })
  @ApiResponse({
    status: 400,
    description: 'Team not in tournament, or submission already evaluated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiForbiddenResponse({
    description: 'Forbidden — insufficient role (USER, JURY, or ADMIN)',
  })
  submit(@Param('id') id: string, @Body() data: SubmitTaskDto) {
    return this.tasksService.submitTask(id, data);
  }

  @Get('tasks/:id/submissions')
  @Serialize(SubmissionListItemDto)
  @Roles(Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({
    summary: 'List submissions for a task (jury review)',
  })
  @ApiOkResponse({
    type: SubmissionListItemDto,
    isArray: true,
    description: 'Submissions with team summary (serialized)',
    schema: { example: tasksExamples.submissionsListResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden — requires JURY or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  getSubmissions(@Param('id') id: string) {
    return this.tasksService.getSubmissionsForTask(id);
  }

  @Post('submissions/:id/evaluate')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiOperation({
    summary:
      'Save jury checklist scores for a submission and finalize its status',
  })
  @ApiBody({
    type: EvaluateSubmissionDto,
    examples: {
      evaluate: { value: tasksExamples.evaluateSubmissionRequest },
    },
  })
  @ApiOkResponse({
    description: 'Evaluation saved (upsert) and submission finalized',
    schema: { example: tasksExamples.evaluationResponse },
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid scores payload, jury profile missing, or submission/task criteria mismatch',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiForbiddenResponse({
    description: 'Forbidden — requires JURY or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  evaluateSubmission(
    @Param('id') id: string,
    @Body() dto: EvaluateSubmissionDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.tasksService.evaluateSubmission(id, userId, dto);
  }
}
