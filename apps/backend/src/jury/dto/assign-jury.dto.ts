import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class AssignJuryDto {
  @ApiProperty({
    example: 4,
    description:
      'Скільки робіт отримує кожен член журі (3–5 за регламентом). ' +
      'Алгоритм гарантує, що кожна робота отримає мінімум tournament.minJuryPerSubmission оцінювачів.',
  })
  @IsInt()
  @Min(1)
  @Max(20)
  submissionsPerJury: number;
}
