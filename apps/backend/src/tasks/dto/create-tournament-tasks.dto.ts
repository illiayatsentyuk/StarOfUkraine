import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
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

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-04-01T09:00:00.000Z',
    description: 'Дата/час початку раунду',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startsAt?: Date;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    example: '2026-04-02T23:59:59.000Z',
    description: 'Дедлайн здачі (кінець подачі рішень)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://drive.google.com/...', 'https://docs.example.com'],
    description: 'Додаткові матеріали (посилання)',
  })
  @IsOptional()
  @IsArray()
  @IsUrl({ require_protocol: true }, { each: true })
  materialUrls?: string[];

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
