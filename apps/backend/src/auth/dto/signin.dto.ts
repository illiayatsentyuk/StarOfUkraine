import { ApiProperty } from '@nestjs/swagger';

export class signinDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd123' })
  password: string;
}
