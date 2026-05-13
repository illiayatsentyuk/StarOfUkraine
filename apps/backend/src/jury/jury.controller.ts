import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { Role } from 'src/enum';
import { authExamples, juryExamples } from '../examples';
import { Serialize } from '../interceptors/serialize.interceptor';
import {
  AddToJuryDto,
  AssignJuryDto,
  AssignJuryResultDto,
  JuryAssignmentResponseDto,
  JuryRecordDto,
  JuryRemoveResponseDto,
} from './dto';
import { JuryService } from './jury.service';

@ApiTags('Jury')
@ApiBearerAuth()
@ApiCookieAuth('access_token')
@ApiExtraModels(JuryRecordDto, JuryRemoveResponseDto, AssignJuryResultDto)
@Controller('jury')
export class JuryController {
  constructor(private readonly juryService: JuryService) {}

  @Get('my-assignments')
  @Roles(Role.JURY, Role.ADMIN)
  @ApiOperation({
    summary: '[JURY] Get submissions assigned to the current juror',
  })
  @ApiQuery({
    name: 'taskId',
    required: false,
    description: 'Filter assignments by task ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of assigned submissions with evaluation status',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — requires JURY or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Jury profile not found' })
  @Serialize(JuryAssignmentResponseDto)
  getMyAssignments(
    @GetCurrentUserId() userId: string,
    @Query('taskId') taskId?: string,
  ) {
    return this.juryService.getMyAssignments(userId, taskId);
  }

  @Get('my-evaluations')
  @Roles(Role.JURY, Role.ADMIN)
  @ApiOperation({
    summary: '[JURY] Get evaluation history for the current juror',
  })
  @ApiResponse({
    status: 200,
    description: 'List of evaluations made by the current juror',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — requires JURY or ADMIN',
  })
  @ApiResponse({ status: 404, description: 'Jury profile not found' })
  getEvaluationHistory(@GetCurrentUserId() userId: string) {
    return this.juryService.getEvaluationHistory(userId);
  }

  @Get()
  @Roles(Role.JURY, Role.ADMIN)
  @ApiOperation({ summary: 'List all jury profiles' })
  @ApiResponse({ status: 200, description: 'Jury profiles returned' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — requires JURY or ADMIN',
  })
  @Serialize(JuryRecordDto)
  findAll() {
    return this.juryService.findAll();
  }

  @Get(':id')
  @Roles(Role.JURY, Role.ADMIN)
  @ApiParam({ name: 'id', description: 'Jury ID' })
  @ApiOperation({ summary: 'Get a jury profile by id' })
  @ApiResponse({
    status: 200,
    description: 'Jury profile returned',
    schema: { example: juryExamples.juryResponse },
  })
  @ApiResponse({ status: 404, description: 'Jury not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — requires JURY or ADMIN',
  })
  @Serialize(JuryRecordDto)
  findOne(@Param('id') id: string) {
    return this.juryService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Add a user to jury for a tournament' })
  @ApiBody({
    type: AddToJuryDto,
    examples: { add: { value: juryExamples.addToJuryRequest } },
  })
  @ApiResponse({
    status: 201,
    description: 'Jury created/updated and connected to tournament',
    schema: { example: juryExamples.juryResponse },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires ADMIN' })
  @Serialize(JuryRecordDto)
  addToJury(@Body() body: AddToJuryDto) {
    return this.juryService.addToJury(body);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'id', description: 'Jury ID' })
  @ApiOperation({ summary: '[ADMIN] Remove a jury profile' })
  @ApiResponse({
    status: 200,
    description: 'Jury removed',
    schema: { example: juryExamples.removeResponse },
  })
  @ApiResponse({ status: 404, description: 'Jury not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires ADMIN' })
  @Serialize(JuryRemoveResponseDto)
  removeFromJury(@Param('id') id: string, @GetCurrentUserId() userId: string) {
    return this.juryService.removeFromJury(id, userId);
  }

  @Post('tournaments/:tournamentId/assign')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiParam({ name: 'tournamentId', description: 'Tournament ID' })
  @ApiOperation({
    summary:
      '[ADMIN] Randomly assign submissions to jury members for a tournament. ' +
      'Clears existing assignments then rebuilds them.',
  })
  @ApiBody({
    type: AssignJuryDto,
    examples: {
      assign: {
        value: juryExamples.assignJuryRequest,
        summary: 'Each juror receives up to N submissions',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Assignments created',
    schema: { example: juryExamples.assignJuryResponse },
  })
  @ApiResponse({
    status: 400,
    description: 'No jury or submissions found for tournament',
  })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
    schema: { example: authExamples.unauthorized },
  })
  @ApiResponse({ status: 403, description: 'Forbidden — requires ADMIN' })
  @Serialize(AssignJuryResultDto)
  assignJury(
    @Param('tournamentId') tournamentId: string,
    @Body() dto: AssignJuryDto,
  ) {
    return this.juryService.assignJury(tournamentId, dto);
  }
}
