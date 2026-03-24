import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from "class-validator";

export class FindQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (1-based)' })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ example: 10, description: 'Items per page (defaults to PAGE_SIZE env var)' })
  @IsOptional()
  @IsNumber()
  limit?: number;
}