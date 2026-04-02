import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentStatus } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTournamentDto {
  @ApiProperty({ example: 'Star of Ukraine Cup 2026' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'Open tournament for teams across Ukraine.' })
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  description?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-01T12:00:00.000Z',
  })
  @IsDate()
  startDate: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-03-20T00:00:00.000Z',
  })
  @IsDate()
  registrationStart: Date;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-03-30T23:59:59.000Z',
  })
  @IsDate()
  registrationEnd: Date;

  @ApiProperty({ example: 64 })
  @IsInt()
  @Min(1)
  maxTeams: number;

  @ApiProperty({ example: 6 })
  @IsInt()
  @Min(1)
  rounds: number;

  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  teamSizeMin: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  teamSizeMax: number;

  @ApiPropertyOptional({
    enum: TournamentStatus,
    example: TournamentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  hideTeamsUntilRegistrationEnds?: boolean;
}
