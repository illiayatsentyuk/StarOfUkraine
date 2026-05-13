import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TournamentStatus } from '@prisma/client';
import { Expose, Type } from 'class-transformer';

export class TournamentTeamSnippetDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  captainName: string;

  @Expose()
  @ApiProperty()
  captainEmail: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  city: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  organization: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  telegram: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  discord: string | null;

  @Expose()
  @ApiProperty()
  isAcceptNewMembers: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class TournamentResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @Expose()
  @ApiProperty()
  startDate: Date;

  @Expose()
  @ApiProperty()
  registrationStart: Date;

  @Expose()
  @ApiProperty()
  registrationEnd: Date;

  @Expose()
  @ApiProperty()
  maxTeams: number;

  @Expose()
  @ApiProperty()
  rounds: number;

  @Expose()
  @ApiProperty()
  teamSizeMin: number;

  @Expose()
  @ApiProperty()
  teamSizeMax: number;

  @Expose()
  @ApiProperty()
  minJuryPerSubmission: number;

  @Expose()
  @ApiProperty({ enum: TournamentStatus })
  status: TournamentStatus;

  @Expose()
  @ApiProperty()
  hideTeamsUntilRegistrationEnds: boolean;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  evaluationFinishedAt: Date | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  createdById: string | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({ type: [TournamentTeamSnippetDto] })
  @Type(() => TournamentTeamSnippetDto)
  teams?: TournamentTeamSnippetDto[];
}

export class PaginatedTournamentsResponseDto {
  @Expose()
  @ApiProperty({ type: [TournamentResponseDto] })
  @Type(() => TournamentResponseDto)
  data: TournamentResponseDto[];

  @Expose()
  @ApiProperty()
  currentPage: number;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  nextPage: number | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  previousPage: number | null;

  @Expose()
  @ApiProperty()
  totalPages: number;

  @Expose()
  @ApiProperty()
  itemsPerPage: number;
}
