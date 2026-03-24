import { TournamentStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTournamentDto {
  @ApiProperty({ example: 'Star of Ukraine Cup 2026' })
  name: string;

  @ApiPropertyOptional({ example: 'Open tournament for teams across Ukraine.' })
  description?: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-04-01T12:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-03-20T00:00:00.000Z' })
  registrationStart: Date;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-03-30T23:59:59.000Z' })
  registrationEnd: Date;

  @ApiProperty({ example: 64 })
  maxTeams: number;

  @ApiProperty({ example: 6 })
  rounds: number;

  @ApiProperty({ example: 5 })
  teamSizeMin: number;

  @ApiProperty({ example: 7 })
  teamSizeMax: number;

  @ApiPropertyOptional({ enum: TournamentStatus, example: TournamentStatus.DRAFT })
  status?: TournamentStatus;

  @ApiPropertyOptional({ example: true })
  hideTeamsUntilRegistrationEnds?: boolean;
}
