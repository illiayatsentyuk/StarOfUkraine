import { Role } from '../../enum/role.enum';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};
