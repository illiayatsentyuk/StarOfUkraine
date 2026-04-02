import { Role } from '../../enum';

export type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
};
