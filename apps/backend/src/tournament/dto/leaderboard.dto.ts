import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class LeaderboardTeamDto {
  @Expose()
  @ApiProperty({ example: 'clx_team_abc' })
  id: string;

  @Expose()
  @ApiProperty({ example: 'Team Alpha' })
  name: string;
}

export class LeaderboardCriterionScoreDto {
  @Expose()
  @ApiProperty({ example: 'code_quality', description: 'Rubric criterion ID' })
  id: string;

  @Expose()
  @ApiProperty({
    example: 8.5,
    description: 'Average points for this criterion across all jurors',
  })
  avgPoints: number;
}

export class LeaderboardTaskScoreDto {
  @Expose()
  @ApiProperty({ example: 'clx_task_1' })
  taskId: string;

  @Expose()
  @ApiProperty({
    example: 27.5,
    description: 'Середній бал журі за цей раунд (0 якщо немає оцінок)',
  })
  avgScore: number;

  @Expose()
  @Type(() => LeaderboardCriterionScoreDto)
  @ApiProperty({
    type: [LeaderboardCriterionScoreDto],
    description: 'Per-criterion average breakdown',
  })
  criteria: LeaderboardCriterionScoreDto[];
}

export class LeaderboardRowDto {
  @Expose()
  @Type(() => LeaderboardTeamDto)
  @ApiProperty({ type: LeaderboardTeamDto })
  team: LeaderboardTeamDto;

  @Expose()
  @ApiProperty({
    example: 55.5,
    description: 'Сума середніх балів журі за всі раунди',
  })
  totalScore: number;

  @Expose()
  @Type(() => LeaderboardTaskScoreDto)
  @ApiProperty({
    type: [LeaderboardTaskScoreDto],
    description: 'Деталізація по раундах (taskId -> avgScore)',
  })
  tasks: LeaderboardTaskScoreDto[];
}
