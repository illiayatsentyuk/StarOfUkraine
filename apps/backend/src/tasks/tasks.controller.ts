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
  EvaluationResponseDto,
  SubmissionListItemDto,
  SubmissionResponseDto,
  SubmissionTeamSummaryDto,
  SubmitTaskDto,
  TaskResponseDto,
  UpdateTaskDto,
} from './dto';
import { TasksService } from './tasks.service';

@ApiTags('Tournaments', 'Tasks')
@ApiExtraModels(
  SubmissionListItemDto,
  SubmissionTeamSummaryDto,
  TaskResponseDto,
  SubmissionResponseDto,
  EvaluationResponseDto,
)
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
    description: 'Forbidden — requires USER, JURY, or ADMIN',
  })
  @Serialize(TaskResponseDto)
  getTasksForTournament(@Param('id') id: string) {
    return this.tasksService.getTasksForTournament(id);
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
    description: 'Forbidden — requires USER, JURY, or ADMIN',
  })
  @Serialize(TaskResponseDto)
  getTask(@Param('id') id: string) {
    return this.tasksService.getTask(id);
  }

  @Get('tasks/:id/submissions')
  @Serialize(SubmissionListItemDto)
  @Roles(Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({ summary: 'List submissions for a task (jury review)' })
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
  @ApiForbiddenResponse({ description: 'Forbidden — requires JURY or ADMIN' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  getSubmissions(@Param('id') id: string) {
    return this.tasksService.getSubmissionsForTask(id);
  }

  @Post('tournaments/:id/tasks')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiOperation({
    summary: '[ADMIN] Create tournament rounds (tasks) and scoring criteria',
  })
  @ApiBody({
    type: CreateTournamentTasksDto,
    examples: { tasks: { value: tasksExamples.createTasksRequest } },
  })
  @ApiCreatedResponse({
    description: 'Tasks created',
    schema: { example: [tasksExamples.taskResponse] },
  })
  @ApiResponse({ status: 400, description: 'Invalid body or duplicate order' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  @ApiForbiddenResponse({ description: 'Forbidden — requires ADMIN' })
  @Serialize(TaskResponseDto)
  createTasks(@Param('id') id: string, @Body() data: CreateTournamentTasksDto) {
    return this.tasksService.createTasks(id, data);
  }

  @Patch('tasks/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({
    summary: '[ADMIN] Update an existing task (round) and scoring criteria',
  })
  @ApiBody({
    type: UpdateTaskDto,
    examples: { update: { value: tasksExamples.updateTaskRequest } },
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
  @ApiForbiddenResponse({ description: 'Forbidden — requires ADMIN' })
  @Serialize(TaskResponseDto)
  update(@Param('id') id: string, @Body() data: UpdateTaskDto) {
    return this.tasksService.updateTask(id, data);
  }

  @Post('tasks/:id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({
    summary: '[ADMIN] Activate a task (DRAFT → ACTIVE), opening submissions',
  })
  @ApiOkResponse({
    description: 'Task activated',
    schema: { example: tasksExamples.taskActiveResponse },
  })
  @ApiResponse({ status: 400, description: 'Task is not in DRAFT status' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiForbiddenResponse({ description: 'Forbidden — requires ADMIN' })
  @Serialize(TaskResponseDto)
  activateTask(@Param('id') id: string) {
    return this.tasksService.activateTask(id);
  }

  @Post('tasks/:id/close-submissions')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({
    summary:
      '[ADMIN] Close submissions for a task (ACTIVE → SUBMISSION_CLOSED)',
  })
  @ApiOkResponse({
    description: 'Submissions closed',
    schema: { example: tasksExamples.taskSubmissionClosedResponse },
  })
  @ApiResponse({ status: 400, description: 'Task is not ACTIVE' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiForbiddenResponse({ description: 'Forbidden — requires ADMIN' })
  @Serialize(TaskResponseDto)
  closeSubmissions(@Param('id') id: string) {
    return this.tasksService.closeSubmissions(id);
  }

  @Post('tasks/:id/submit')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.USER)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiOperation({ summary: '[TEAM] Submit GitHub / video links for a task' })
  @ApiBody({
    type: SubmitTaskDto,
    examples: { submit: { value: tasksExamples.submitTaskRequest } },
  })
  @ApiOkResponse({
    description: 'Submission created or updated',
    schema: { example: tasksExamples.submissionResponse },
  })
  @ApiResponse({
    status: 400,
    description: 'Task not ACTIVE, deadline passed, or team not registered',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiForbiddenResponse({
    description: 'Forbidden — requires USER (team member)',
  })
  @Serialize(SubmissionResponseDto)
  submit(@Param('id') id: string, @Body() data: SubmitTaskDto) {
    return this.tasksService.submitTask(id, data);
  }

  @Post('submissions/:id/evaluate')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.JURY, Role.ADMIN)
  @ApiBearerAuth()
  @ApiCookieAuth('access_token')
  @ApiParam({ name: 'id', description: 'Submission ID' })
  @ApiOperation({
    summary: '[JURY] Save evaluation scores for an assigned submission',
  })
  @ApiBody({
    type: EvaluateSubmissionDto,
    examples: { evaluate: { value: tasksExamples.evaluateSubmissionRequest } },
  })
  @ApiOkResponse({
    description:
      'Evaluation saved (upsert); submission marked EVALUATED when minJuryPerSubmission reached',
    schema: { example: tasksExamples.evaluationResponse },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid scores, jury not found, or task still ACTIVE',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Jury not assigned to this submission',
  })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @Serialize(EvaluationResponseDto)
  evaluateSubmission(
    @Param('id') id: string,
    @Body() dto: EvaluateSubmissionDto,
    @GetCurrentUserId() userId: string,
  ) {
    return this.tasksService.evaluateSubmission(id, userId, dto);
  }
}
