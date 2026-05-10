import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { tasksExamples } from '../../examples/tasks/tasks.examples';

const ex = tasksExamples.submitTaskRequest;

export class SubmitTaskDto {
  @ApiProperty({ example: ex.teamId })
  @IsString()
  @MinLength(1)
  teamId: string;

  @ApiProperty({
    example: ex.githubUrl,
    description: 'Посилання на репозиторій GitHub',
  })
  @IsUrl({ require_protocol: true })
  githubUrl: string;

  @ApiProperty({
    example: ex.videoUrl,
    description: 'Посилання на відео (YouTube тощо)',
  })
  @IsUrl({ require_protocol: true })
  videoUrl: string;

  @ApiPropertyOptional({
    example: ex.liveUrl,
    description: 'Посилання на live demo (опційно)',
  })
  @IsOptional()
  @IsUrl({ require_protocol: true })
  liveUrl?: string;

  @ApiPropertyOptional({
    example: ex.summary,
    description: 'Короткий опис (що зроблено, як запускати)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5_000)
  summary?: string;
}
