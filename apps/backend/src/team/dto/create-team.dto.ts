import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({ example: 'Star of Ukraine' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 'Olena Kovalenko' })
  @IsString()
  @MinLength(1)
  captainName: string;

  @ApiProperty({ example: 'olena@example.com' })
  @IsEmail()
  captainEmail: string;

  @ApiProperty({
    type: [String],
    description: 'Registered user emails; must include the captain email.',
    example: ['olena@example.com', 'taras@example.com', 'andrii@example.com'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsEmail({}, { each: true })
  memberEmails: string[];

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
