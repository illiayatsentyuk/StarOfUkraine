import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class JoinTournamentDto {
  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  teamId: string;
}
