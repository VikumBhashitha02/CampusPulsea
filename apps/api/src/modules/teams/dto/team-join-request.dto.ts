import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TeamJoinRequestDto {
  @ApiPropertyOptional({ example: 'I am proficient in NestJS, React, and UI design' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ example: 'Backend Developer' })
  @IsOptional()
  @IsString()
  preferredRole?: string;
}
