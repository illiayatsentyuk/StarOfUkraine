import { ApiProperty } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiProperty({ required: false })
  teamName?: string;

  @ApiProperty({ required: false })
  captainName?: string;

  @ApiProperty({ required: false })
  captainEmail?: string;

  @ApiProperty({ type: [String], required: false })
  members?: string[];

  @ApiProperty({ required: false })
  city?: string;

  @ApiProperty({ required: false })
  organization?: string;

  @ApiProperty({ required: false })
  telegram?: string;

  @ApiProperty({ required: false })
  discord?: string;
}

