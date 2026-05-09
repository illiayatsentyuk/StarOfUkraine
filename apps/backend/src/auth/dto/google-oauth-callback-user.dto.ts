import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../enum';

/** Shape of `req.user` after `GoogleStrategy.validate` (JWT-like payload for session/cookies). */
export class GoogleOAuthCallbackUserDto {
  @ApiProperty({ description: 'User id (same as DB user id)' })
  sub: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;
}
