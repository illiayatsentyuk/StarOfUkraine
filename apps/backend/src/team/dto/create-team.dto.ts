import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty()
  teamName: string;

  @ApiProperty()
  captainName: string;

  @ApiProperty()
  captainEmail: string;

  @ApiProperty({ type: [String] })
  members: string[];

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  organization?: string;

  @ApiProperty({ required: false })
  telegram?: string;

  @ApiProperty({ required: false })
  discord?: string;
}

