import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EvaluationResponseDto {
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
  @ApiProperty({ description: 'Serialized rubric scores (JSON)' })
  scores: Record<string, unknown>;

  @Expose()
  @ApiProperty()
  totalScore: number;

  @Expose()
  @ApiProperty()
  comment: string;
}
