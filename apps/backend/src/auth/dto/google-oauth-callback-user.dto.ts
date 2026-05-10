import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enum';

export class GoogleOAuthCallbackUserDto {
  @ApiProperty({ description: 'User id (same as DB user id)' })
  sub: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;
}
