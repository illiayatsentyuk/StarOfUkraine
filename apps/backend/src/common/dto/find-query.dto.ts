import { IsNumber, IsOptional } from "class-validator";

export class FindQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}