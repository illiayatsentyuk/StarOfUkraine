import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { SortBy, SortOrder } from '../../enum';

export class FindQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based)' })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page (defaults to PAGE_SIZE env var)',
  })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ enum: SortOrder, description: 'Sort order' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ enum: SortBy, description: 'Sort by' })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;
}
