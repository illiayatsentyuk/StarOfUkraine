import { ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SortOrder, TournamentsSortBy } from '../../enum';

export class FindTournamentQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page (defaults to PAGE_SIZE env var)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ enum: TournamentsSortBy, description: 'Sort by' })
  @IsOptional()
  @IsEnum(TournamentsSortBy)
  sortBy?: TournamentsSortBy;

  @ApiPropertyOptional({
    example: 'Cup 2026',
    description: 'Filter by name (case-insensitive contains)',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    enum: TournamentStatus,
    description: 'Filter by tournament status',
    example: TournamentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

}
