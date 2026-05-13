import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubmissionStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class SubmissionResponseDto {
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
  @ApiPropertyOptional({ nullable: true })
  liveUrl: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  summary: string | null;

  @Expose()
  @ApiProperty({ enum: SubmissionStatus })
  status: SubmissionStatus;
}
