import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Star of Ukraine' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'Olena Kovalenko' })
  @IsString()
  @MinLength(1)
  captainName: string;

  @ApiPropertyOptional({ example: 'Kyiv' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'UA Esports' })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional({ example: '@starofukraine' })
  @IsOptional()
  @IsString()
  telegram?: string;

  @ApiPropertyOptional({ example: 'starofukraine#1234' })
  @IsOptional()
  @IsString()
  discord?: string;
}
