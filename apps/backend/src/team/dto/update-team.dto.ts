import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Star of Ukraine' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  teamName?: string;

  @ApiPropertyOptional({ example: 'Olena Kovalenko' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  captainName?: string;

  @ApiPropertyOptional({ example: 'olena@example.com' })
  @IsOptional()
  @IsEmail()
  captainEmail?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['Olena Kovalenko', 'Taras Shevchenko', 'Andrii Melnyk'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  members?: string[];

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
