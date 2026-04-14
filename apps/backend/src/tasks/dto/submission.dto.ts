import { ApiProperty } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

/** Команда в контексті списку робіт для журі. */
export class SubmissionTeamSummaryDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  captainName: string;

  @Expose()
  @ApiProperty()
  captainEmail: string;

  @Expose()
  @ApiProperty({ nullable: true })
  city: string | null;

  @Expose()
  @ApiProperty({ nullable: true })
  organization: string | null;
}

/** Один рядок у відповіді `GET /tasks/:id/submissions`. */
export class SubmissionListItemDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  taskId: string;

  @Expose()
  @ApiProperty()
  teamId: string;

  @Expose()
  @ApiProperty()
  githubUrl: string;

  @Expose()
  @ApiProperty()
  videoUrl: string;

  @Expose()
  @ApiProperty({ enum: SubmissionStatus })
  status: SubmissionStatus;

  @Expose()
  @Type(() => SubmissionTeamSummaryDto)
  @ApiProperty({ type: SubmissionTeamSummaryDto })
  team: SubmissionTeamSummaryDto;
}
