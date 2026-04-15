import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MinLength } from 'class-validator';
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
}
