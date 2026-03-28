import { Role } from '../../enum/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class signupDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ enum: Role, required: false })
  role?: Role;
}
