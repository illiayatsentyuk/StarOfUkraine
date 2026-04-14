import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsObject,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateTaskItemDto {
  @ApiProperty({ example: 'Раунд 1 — Відбірковий' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    example: '## Завдання\n\nРеалізуйте API для...\n',
    description: 'Markdown',
  })
  @IsString()
  @MinLength(1)
  description: string;

  @ApiProperty({ example: 1, description: 'Порядок раунду (сортування)' })
  @IsInt()
  @Min(0)
  order: number;

  @ApiProperty({
    example: {
      rubric: [
        { id: 'code', label: 'Якість коду', maxPoints: 10 },
        { id: 'tests', label: 'Тести', maxPoints: 5 },
      ],
    },
    description: 'Критерії оцінювання (структура на розсуд клієнта)',
  })
  @IsObject()
  criteria: Record<string, unknown>;
}

export class CreateTournamentTasksDto {
  @ApiProperty({ type: [CreateTaskItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTaskItemDto)
  tasks: CreateTaskItemDto[];
}
