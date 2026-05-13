import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class JuryRecordDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class JuryRemoveResponseDto {
  @Expose()
  @ApiProperty()
  message: string;
}

export class AssignJuryResultDto {
  @Expose()
  @ApiProperty()
  assignmentsCreated: number;

  @Expose()
  @ApiProperty()
  submissionsCount: number;

  @Expose()
  @ApiProperty()
  juryCount: number;
}

class AssignmentTeamDto {
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
}

class AssignmentEvaluationDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  totalScore: number;

  @Expose()
  @ApiProperty()
  scores: unknown;

  @Expose()
  @ApiPropertyOptional()
  comment?: string;
}

class AssignmentSubmissionDto {
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
  @ApiPropertyOptional()
  liveUrl?: string;

  @Expose()
  @ApiPropertyOptional()
  summary?: string;

  @Expose()
  @ApiProperty()
  status: string;

  @Expose()
  @Type(() => AssignmentTeamDto)
  @ApiProperty({ type: AssignmentTeamDto })
  team: AssignmentTeamDto;

  @Expose()
  @Type(() => AssignmentEvaluationDto)
  @ApiProperty({ type: [AssignmentEvaluationDto] })
  evaluations: AssignmentEvaluationDto[];
}

export class JuryAssignmentResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  submissionId: string;

  @Expose()
  @ApiProperty()
  juryId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @Type(() => AssignmentSubmissionDto)
  @ApiProperty({ type: AssignmentSubmissionDto })
  submission: AssignmentSubmissionDto;
}
