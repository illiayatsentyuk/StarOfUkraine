import { Role } from '../../enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ enum: Role, required: false })
  role?: Role;
}

