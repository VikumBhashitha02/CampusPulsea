import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ example: 'cl12345user' })
  id!: string;

  @ApiProperty({ example: 'ayesha.fernando@student.uoc.test' })
  email!: string;

  @ApiProperty({ example: 'Ayesha Fernando' })
  name!: string;

  @ApiProperty({ example: null, nullable: true })
  avatarUrl?: string | null;

  @ApiProperty({ example: ['STUDENT'] })
  roles!: string[];
}

export class AuthResponseDto {
  @ApiProperty()
  user!: AuthUserDto;

  @ApiProperty({ description: 'Signed JWT Bearer Access Token' })
  accessToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;

  @ApiProperty({ example: '7d' })
  expiresIn!: string;
}
