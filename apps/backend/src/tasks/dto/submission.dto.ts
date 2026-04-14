import { ApiProperty } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';
import { tasksExamples } from '../../examples/tasks/tasks.examples';

const teamEx = tasksExamples.submissionsListResponse[0].team;
const rowEx = tasksExamples.submissionsListResponse[0];

/** Команда в контексті списку робіт для журі. */
export class SubmissionTeamSummaryDto {
  @Expose()
  @ApiProperty({ example: teamEx.id })
  id: string;

  @Expose()
  @ApiProperty({ example: teamEx.name })
  name: string;

  @Expose()
  @ApiProperty({ example: teamEx.captainName })
  captainName: string;

  @Expose()
  @ApiProperty({ example: teamEx.captainEmail })
  captainEmail: string;

  @Expose()
  @ApiProperty({ nullable: true, example: teamEx.city })
  city: string | null;

  @Expose()
  @ApiProperty({ nullable: true, example: teamEx.organization })
  organization: string | null;
}

/** Один рядок у відповіді `GET /tasks/:id/submissions`. */
export class SubmissionListItemDto {
  @Expose()
  @ApiProperty({ example: rowEx.id })
  id: string;

  @Expose()
  @ApiProperty({ example: rowEx.taskId })
  taskId: string;

  @Expose()
  @ApiProperty({ example: rowEx.teamId })
  teamId: string;

  @Expose()
  @ApiProperty({ example: rowEx.githubUrl })
  githubUrl: string;

  @Expose()
  @ApiProperty({ example: rowEx.videoUrl })
  videoUrl: string;

  @Expose()
  @ApiProperty({
    enum: SubmissionStatus,
    example: SubmissionStatus.PENDING,
  })
  status: SubmissionStatus;

  @Expose()
  @Type(() => SubmissionTeamSummaryDto)
  @ApiProperty({ type: SubmissionTeamSummaryDto })
  team: SubmissionTeamSummaryDto;
}
