import { TournamentStatus } from '@prisma/client';

export class CreateTournamentDto {
  name: string;
  description?: string;
  startDate: Date;
  registrationStart: Date;
  registrationEnd: Date;
  maxTeams: number;
  rounds: number;
  teamSizeMin: number;
  teamSizeMax: number;
  status?: TournamentStatus;
  hideTeamsUntilRegistrationEnds?: boolean;
}

