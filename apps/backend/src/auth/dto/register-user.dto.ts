import { Role } from '../../enums/role.enum';

export class RegisterUserDto {
  email: string;
  password: string;
  name?: string;
  role?: Role;
}

