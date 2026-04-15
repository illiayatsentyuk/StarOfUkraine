import { Expose } from 'class-transformer';
import { Role } from '../../enum';

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
}
