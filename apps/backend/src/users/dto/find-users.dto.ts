import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class FindUsersDto {
  @ApiProperty({
    description: 'Search query for users (name/email/nameId).',
    example: 'olena',
  })
  @IsString()
  @MinLength(1)
  query: string;
}

