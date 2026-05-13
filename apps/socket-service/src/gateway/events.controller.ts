import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectPinoLogger, type PinoLogger } from 'pino-nestjs';
import type {
  SubmissionEvaluatedPayload,
  TaskSubmittedPayload,
} from '../types/index';
import { TournamentGateway } from './tournament.gateway';

@Controller()
export class EventsController {
  constructor(
    private readonly gateway: TournamentGateway,
    @InjectPinoLogger(EventsController.name)
    private readonly logger: PinoLogger,
  ) {}

  @MessagePattern('task.submitted')
  handleTaskSubmitted(@Payload() data: TaskSubmittedPayload): void {
    this.logger.info(
      { tournamentId: data.tournamentId, taskId: data.taskId },
      'Received task.submitted event from backend',
    );
    this.gateway.notifyTaskSubmitted(data);
  }

  @MessagePattern('submission.evaluated')
  handleSubmissionEvaluated(@Payload() data: SubmissionEvaluatedPayload): void {
    this.logger.info(
      { submissionId: data.submissionId, finalised: data.finalised },
      'Received submission.evaluated event from backend',
    );
    this.gateway.notifySubmissionEvaluated(data);
  }
}
