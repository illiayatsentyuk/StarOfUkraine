import { TournamentStatus } from '../../../generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTournamentDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  registrationStart: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  registrationEnd: Date;

  @ApiProperty()
  maxTeams: number;

  @ApiProperty()
  rounds: number;

  @ApiProperty()
  teamSizeMin: number;

  @ApiProperty()
  teamSizeMax: number;

  @ApiProperty({ enum: TournamentStatus, required: false })
  status?: TournamentStatus;

  @ApiProperty({ required: false })
  hideTeamsUntilRegistrationEnds?: boolean;
}
