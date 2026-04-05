import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SortOrder, TeamsSortBy } from '../../enum';

export class FindTeamQueryDto {
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

  @ApiPropertyOptional({ enum: TeamsSortBy, description: 'Sort by' })
  @IsOptional()
  @IsEnum(TeamsSortBy)
  sortBy?: TeamsSortBy;

  @ApiPropertyOptional({
    example: 'Kyiv',
    description: 'Filter by name or id (case-insensitive contains)',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
