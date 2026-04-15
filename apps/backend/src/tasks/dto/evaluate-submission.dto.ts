import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class EvaluationRubricScoreDto {
  @ApiProperty({
    example: 'code',
    description: 'ID пункту чек-ліста (criteria.rubric[].id)',
  })
  @IsString()
  @MinLength(1)
  id: string;

  @ApiProperty({ example: 10, description: 'Нараховані бали за пункт' })
  @IsInt()
  @Min(0)
  points: number;
}

export class EvaluateSubmissionDto {
  @ApiProperty({
    type: [EvaluationRubricScoreDto],
    description: 'Оцінки по пунктах чек-ліста (rubric)',
    example: [{ id: 'functionality', points: 35 }],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EvaluationRubricScoreDto)
  scores: EvaluationRubricScoreDto[];

  @ApiProperty({
    example: 'Сильна реалізація, але бракує тестів.',
    description: 'Коментар журі',
  })
  @IsString()
  @MinLength(1)
  comment: string;
}

