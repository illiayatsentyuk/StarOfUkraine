import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Star of Ukraine' })
  teamName?: string;

  @ApiPropertyOptional({ example: 'Olena Kovalenko' })
  captainName?: string;

  @ApiPropertyOptional({ example: 'olena@example.com' })
  captainEmail?: string;

  @ApiPropertyOptional({ type: [String], example: ['Olena Kovalenko', 'Taras Shevchenko', 'Andrii Melnyk'] })
  members?: string[];

  @ApiPropertyOptional({ example: 'Kyiv' })
  city?: string;

  @ApiPropertyOptional({ example: 'UA Esports' })
  organization?: string;

  @ApiPropertyOptional({ example: '@starofukraine' })
  telegram?: string;

  @ApiPropertyOptional({ example: 'starofukraine#1234' })
  discord?: string;
}
