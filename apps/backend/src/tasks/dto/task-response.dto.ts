import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';
import { Expose } from 'class-transformer';

export class TaskResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  tournamentId: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  description: string;

  @Expose()
  @ApiProperty()
  order: number;

  @Expose()
  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  startsAt: Date | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  deadline: Date | null;

  @Expose()
  @ApiProperty({ type: [String] })
  materialUrls: string[];

  @Expose()
  @ApiProperty({ description: 'Scoring rubric and metadata (JSON)' })
  criteria: Record<string, unknown>;
}
