export class CreateTeamDto {
  teamName: string;
  captainName: string;
  captainEmail: string;
  members: string[];
  city?: string;
  organization?: string;
  telegram?: string;
  discord?: string;
}

