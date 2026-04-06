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
  name?: string;

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
    description: 'Registered user emails; must include the captain email.',
    example: ['olena@example.com', 'taras@example.com', 'andrii@example.com'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  memberEmails?: string[];

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
