import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTeamDto {
  @ApiPropertyOptional({ example: 'cl12345event', description: 'Competition/event ID' })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiProperty({ example: 'BinaryPulse Innovators' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Looking for a UI designer and backend developer' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 4, default: 4 })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(10)
  maxMembers?: number;

  @ApiPropertyOptional({ example: ['Frontend Developer', 'UI/UX Designer'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredRoles?: string[];

  @ApiPropertyOptional({ example: ['React', 'TypeScript', 'Figma'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];
}
