import { TournamentStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTournamentDto {
  @ApiPropertyOptional({ example: 'Star of Ukraine Cup 2026' })
  name?: string;

  @ApiPropertyOptional({ example: 'Open tournament for teams across Ukraine.' })
  description?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time', example: '2026-04-01T12:00:00.000Z' })
  startDate?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time', example: '2026-03-20T00:00:00.000Z' })
  registrationStart?: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time', example: '2026-03-30T23:59:59.000Z' })
  registrationEnd?: Date;

  @ApiPropertyOptional({ example: 64 })
  maxTeams?: number;

  @ApiPropertyOptional({ example: 6 })
  rounds?: number;

  @ApiPropertyOptional({ example: 5 })
  teamSizeMin?: number;

  @ApiPropertyOptional({ example: 7 })
  teamSizeMax?: number;

  @ApiPropertyOptional({ enum: TournamentStatus, example: TournamentStatus.DRAFT })
  status?: TournamentStatus;

  @ApiPropertyOptional({ example: true })
  hideTeamsUntilRegistrationEnds?: boolean;
}
