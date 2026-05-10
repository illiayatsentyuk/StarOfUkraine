import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class JuryRecordDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  userId: string;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class JuryRemoveResponseDto {
  @Expose()
  @ApiProperty()
  message: string;
}

export class AssignJuryResultDto {
  @Expose()
  @ApiProperty()
  assignmentsCreated: number;

  @Expose()
  @ApiProperty()
  submissionsCount: number;

  @Expose()
  @ApiProperty()
  juryCount: number;
}
