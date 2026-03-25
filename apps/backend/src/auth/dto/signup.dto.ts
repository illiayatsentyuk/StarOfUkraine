import { Role } from '../../enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  password: string;

  @ApiPropertyOptional({ example: 'Ivan Petrenko' })
  name?: string;

  @ApiPropertyOptional({ enum: Role, example: Role.USER })
  role?: Role;
}
