import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AddToJuryDto {
  @ApiProperty({ example: 'tournament-1' })
  @IsString()
  @IsNotEmpty()
  tournamentId: string;

  @ApiProperty({ example: 'user-1' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
