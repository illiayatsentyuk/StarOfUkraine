import { ApiProperty } from '@nestjs/swagger';

export class signinDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}
