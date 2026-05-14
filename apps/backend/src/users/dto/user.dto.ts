import { Expose, Type } from 'class-transformer';
import { Role } from '../../enum';

export class UserTeamDto {
  @Expose()
  id: string;

  @Expose()
  name: string;
}

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  nameId: string;

  @Expose()
  image: string;

  @Expose()
  role: Role;

  @Expose()
  @Type(() => UserTeamDto)
  teamsAsCaptain?: UserTeamDto[] = [];

  @Expose()
  @Type(() => UserTeamDto)
  teamsAsMember?: UserTeamDto[] = [];
}
