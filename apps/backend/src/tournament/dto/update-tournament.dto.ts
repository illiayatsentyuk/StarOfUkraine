import { ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
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

export class UpdateTournamentDto {
  @ApiPropertyOptional({ example: 'Star of Ukraine Cup 2026' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ example: 'Open tournament for teams across Ukraine.' })
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  description?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-04-01T12:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-03-20T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationStart?: Date;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-03-30T23:59:59.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  registrationEnd?: Date;

  @ApiPropertyOptional({ example: 64 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxTeams?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(1)
  rounds?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  teamSizeMin?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsInt()
  @Min(1)
  teamSizeMax?: number;

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

  @ApiPropertyOptional({
    example: 2,
    description: 'Скільки членів журі повинні оцінити кожну роботу',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  minJuryPerSubmission?: number;
}
