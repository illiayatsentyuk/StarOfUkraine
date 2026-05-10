import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Role } from '../../enum';

export class TeamMemberUserDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  name: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  nameId: string | null;

  @Expose()
  @ApiPropertyOptional({ nullable: true })
  image: string | null;

  @Expose()
  @ApiProperty({ enum: Role })
  role: Role;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}

export class TeamResponseDto {
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
  @ApiProperty({ type: [TeamMemberUserDto] })
  @Type(() => TeamMemberUserDto)
  members: TeamMemberUserDto[];

  @Expose()
  @ApiProperty({ type: TeamMemberUserDto })
  @Type(() => TeamMemberUserDto)
  captain: TeamMemberUserDto;

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

export class PaginatedTeamsResponseDto {
  @Expose()
  @ApiProperty({ type: [TeamResponseDto] })
  @Type(() => TeamResponseDto)
  data: TeamResponseDto[];

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
