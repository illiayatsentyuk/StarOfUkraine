import { TournamentStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTournamentDto {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  startDate?: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  registrationStart?: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  registrationEnd?: Date;

  @ApiProperty({ required: false })
  maxTeams?: number;

  @ApiProperty({ required: false })
  rounds?: number;

  @ApiProperty({ required: false })
  teamSizeMin?: number;

  @ApiProperty({ required: false })
  teamSizeMax?: number;

  @ApiProperty({ enum: TournamentStatus, required: false })
  status?: TournamentStatus;

  @ApiProperty({ required: false })
  hideTeamsUntilRegistrationEnds?: boolean;
}
