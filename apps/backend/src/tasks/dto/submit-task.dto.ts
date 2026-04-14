import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, MinLength } from 'class-validator';

export class SubmitTaskDto {
  @ApiProperty({ example: 'clx_team_abc' })
  @IsString()
  @MinLength(1)
  teamId: string;

  @ApiProperty({
    example: 'https://github.com/org/repo',
    description: 'Посилання на репозиторій GitHub',
  })
  @IsUrl({ require_protocol: true })
  githubUrl: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=example',
    description: 'Посилання на відео (YouTube тощо)',
  })
  @IsUrl({ require_protocol: true })
  videoUrl: string;
}
