import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class CreateTeamDto {
  @ApiProperty({ example: 'Star of Ukraine' })
  @IsString()
  @MinLength(1)
  teamName: string

  @ApiProperty({ example: 'Olena Kovalenko' })
  @IsString()
  @MinLength(1)
  captainName: string

  @ApiProperty({ example: 'olena@example.com' })
  @IsEmail()
  captainEmail: string

  @ApiProperty({
    type: [String],
    example: ['Olena Kovalenko', 'Taras Shevchenko', 'Andrii Melnyk'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  members: string[]

  @ApiPropertyOptional({ example: 'Kyiv' })
  @IsOptional()
  @IsString()
  city?: string

  @ApiPropertyOptional({ example: 'UA Esports' })
  @IsOptional()
  @IsString()
  organization?: string

  @ApiPropertyOptional({ example: '@starofukraine' })
  @IsOptional()
  @IsString()
  telegram?: string

  @ApiPropertyOptional({ example: 'starofukraine#1234' })
  @IsOptional()
  @IsString()
  discord?: string
}
